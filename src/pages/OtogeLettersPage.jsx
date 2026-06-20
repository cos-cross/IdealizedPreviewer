import { useMemo, useState } from 'react'

const DEFAULT_SONG_POOL = [
  { title: 'Freedom Dive', artist: 'xi', level: 'INF' },
  { title: 'Bad Apple', artist: 'Alstroemeria Records', level: 'HARD' },
  { title: 'Conflict', artist: 'siromaru + cranky', level: 'EXH' },
  { title: 'Blue Zenith', artist: 'xi', level: 'MAXIMUM' },
  { title: 'Brain Power', artist: 'NOMA', level: 'ANOTHER' },
]

function isRevealableChar(char) {
  return char.trim() !== ''
}

function countRevealableChars(text) {
  return text.split('').filter(isRevealableChar).length
}

function getMaskedTitleSegments(title, openedIndexes) {
  return title.split('').map((char, index) => {
    if (!isRevealableChar(char)) {
      return { char, className: 'text-body' }
    }

    const isOpened = openedIndexes.has(index)
    return {
      char: isOpened ? char : '_',
      className: isOpened ? 'text-body' : 'text-secondary',
    }
  })
}

function serializeMaskedTitle(title, openedIndexes) {
  return title
    .split('')
    .map((char, index) => {
      if (!isRevealableChar(char)) {
        return char
      }
      return openedIndexes.has(index) ? char : '*'
    })
    .join('')
}

function formatSongPool(pool) {
  return pool.map((song) => `${song.title}|${song.artist}|${song.level}`).join('\n')
}

function parseSongPoolInput(rawText) {
  const lines = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length === 0) {
    return { error: '曲目池不能为空。' }
  }

  const parsed = []
  for (const line of lines) {
    const [rawTitle = '', rawArtist = '', rawLevel = ''] = line.split('|')
    const title = rawTitle.trim()
    const artist = rawArtist.trim() || 'Various Artists'
    const level = rawLevel.trim() || 'Unknown'

    if (!title) {
      return { error: `存在空歌名行：${line}` }
    }
    if (countRevealableChars(title) === 0) {
      return { error: `歌名必须包含至少一个可揭示字符：${title}` }
    }

    parsed.push({ title, artist, level })
  }

  return { value: parsed }
}

function createEmptyOpenedBySong(pool) {
  return pool.map(() => [])
}

function createEmptyRevealedBySong(pool) {
  return pool.map(() => false)
}

function OtogeLettersPage() {
  const [songPool, setSongPool] = useState(DEFAULT_SONG_POOL)
  const [songPoolDraft, setSongPoolDraft] = useState(formatSongPool(DEFAULT_SONG_POOL))
  const [openedBySong, setOpenedBySong] = useState(createEmptyOpenedBySong(DEFAULT_SONG_POOL))
  const [revealedBySong, setRevealedBySong] = useState(createEmptyRevealedBySong(DEFAULT_SONG_POOL))
  const [guessedChars, setGuessedChars] = useState([])
  const [targetLetter, setTargetLetter] = useState('')
  const [message, setMessage] = useState('')

  const songStates = useMemo(() => {
    return songPool.map((song, index) => {
      const totalLetters = countRevealableChars(song.title)
      const openedLetters = (openedBySong[index] ?? []).length
      return {
        index,
        song,
        totalLetters,
        openedLetters,
        isCompleted: openedLetters >= totalLetters,
        isShown: openedLetters >= totalLetters || Boolean(revealedBySong[index]),
      }
    })
  }, [songPool, openedBySong, revealedBySong])

  const revealableLetters = useMemo(() => {
    const letters = new Set()

    songPool.forEach((song, songIndex) => {
      const opened = new Set(openedBySong[songIndex] ?? [])
      song.title.split('').forEach((char, charIndex) => {
        if (isRevealableChar(char) && !opened.has(charIndex)) {
          letters.add(char)
        }
      })
    })

    return [...letters]
  }, [songPool, openedBySong])

  const textualState = useMemo(() => {
    const guessedLine = `guessed:${guessedChars.join('')}`
    const songLines = songPool.map((song, songIndex) => {
      const prefix = `${songIndex + 1}. `
      if (revealedBySong[songIndex]) {
        return `${prefix}${song.title}`
      }
      const opened = new Set(openedBySong[songIndex] ?? [])
      return `${prefix}${serializeMaskedTitle(song.title, opened)}`
    })
    return [guessedLine, ...songLines].join('\n')
  }, [guessedChars, songPool, openedBySong, revealedBySong])

  const addGuessedChar = (char) => {
    setGuessedChars((previous) => (previous.includes(char) ? previous : [...previous, char]))
  }

  const revealLetterAcrossSongs = (letter) => {
    setOpenedBySong((previous) => {
      return songPool.map((song, songIndex) => {
        const opened = new Set(previous[songIndex] ?? [])
        song.title.split('').forEach((char, charIndex) => {
          if (('a' <= letter <= 'z' || 'A' <= letter <= 'Z') && ('a' <= char <= 'z' || 'A' <= char <= 'Z')){
            if(char.toLowerCase() === letter.toLowerCase()) {
              opened.add(charIndex)
            }
          }
          if (char === letter) {
            opened.add(charIndex)
          }
        })
        return [...opened]
      })
    })
  }

  const openNextLetter = () => {
    if (revealableLetters.length === 0) {
      setMessage('全部曲目都已揭示完毕。')
      return
    }

    const randomChar = revealableLetters[Math.floor(Math.random() * revealableLetters.length)]
    addGuessedChar(randomChar)
    revealLetterAcrossSongs(randomChar)
    setMessage(`已在全部曲目揭示字符 "${randomChar}"。`)
  }

  const openSpecificLetter = () => {
    const normalized = targetLetter
    if (normalized.length !== 1) {
      setMessage('请输入单个字符。')
      return
    }

    addGuessedChar(normalized)

    const revealableCount = songPool.reduce((count, song, songIndex) => {
      const opened = new Set(openedBySong[songIndex] ?? [])
      const matched = song.title
        .split('')
        .filter((char, charIndex) => char === normalized && !opened.has(charIndex)).length
      return count + matched
    }, 0)

    if (revealableCount === 0) {
      setMessage(`已记录字符 "${normalized}"，但未在任何歌曲中匹配。`)
      return
    }

    revealLetterAcrossSongs(normalized)
    setMessage(`已在全部曲目揭示字符 "${normalized}"。`)
  }

  const revealSongFully = (songIndex) => {
    setRevealedBySong((previous) => {
      const next = [...previous]
      next[songIndex] = true
      return next
    })
    setMessage(`已全部揭开：${songPool[songIndex].title}`)
  }

  const copyTextualState = async () => {
    try {
      await navigator.clipboard.writeText(textualState)
      setMessage('文字化状态已复制到剪贴板。')
    } catch {
      setMessage('复制失败：当前环境不支持剪贴板写入。')
    }
  }

  const applySongPool = () => {
    const parsed = parseSongPoolInput(songPoolDraft)
    if (parsed.error) {
      setMessage(parsed.error)
      return
    }

    const nextPool = parsed.value
    setSongPool(nextPool)
    setOpenedBySong(createEmptyOpenedBySong(nextPool))
    setRevealedBySong(createEmptyRevealedBySong(nextPool))
    setTargetLetter('')
    setMessage(`曲目池已更新，共 ${nextPool.length} 首。`)
  }

  const resetSongPool = () => {
    setSongPool(DEFAULT_SONG_POOL)
    setSongPoolDraft(formatSongPool(DEFAULT_SONG_POOL))
    setOpenedBySong(createEmptyOpenedBySong(DEFAULT_SONG_POOL))
    setRevealedBySong(createEmptyRevealedBySong(DEFAULT_SONG_POOL))
    setGuessedChars([])
    setTargetLetter('')
    setMessage('曲目池已重置为默认配置。')
  }

  const resetState = () => {
    setOpenedBySong(createEmptyOpenedBySong(songPool))
    setRevealedBySong(createEmptyRevealedBySong(songPool))
    setGuessedChars([])
    setTargetLetter('')
    setMessage('当前状态已重置。')
  }

  return (
    <section className="py-5">
      <div className="container">
        <div className="row justify-content-center g-4">
          <div className="col-xl-10">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 p-lg-5">
                <h1 className="h3 mb-3">音游开字母</h1>

                <p className="text-secondary mb-3">
                  不再区分当前/未当前曲目；所有开字符操作统一直接作用到全部曲目。
                </p>

                <div className="d-flex gap-2 flex-wrap mb-3">
                  <button type="button" className="btn btn-primary" onClick={openNextLetter}>
                    开一个字符（全曲目同步）
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={resetState}>
                    重置状态
                  </button>
                </div>

                <div className="row g-2 align-items-center mb-4">
                  <div className="col-sm-4">
                    <input
                      type="text"
                      className="form-control"
                      maxLength={1}
                      value={targetLetter}
                      onChange={(event) => setTargetLetter(event.target.value)}
                      placeholder="输入字符，例如 A"
                    />
                  </div>
                  <div className="col-sm-auto">
                    <button type="button" className="btn btn-outline-primary" onClick={openSpecificLetter}>
                      开指定字符（全曲目同步）
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-secondary mb-2">已猜过字符</p>
                  <div className="d-flex gap-2 flex-wrap">
                    {guessedChars.length > 0 ? (
                      guessedChars.map((char) => (
                        <span key={char} className="badge text-bg-dark">
                          {char}
                        </span>
                      ))
                    ) : (
                      <span className="text-secondary">暂无</span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-secondary mb-2">文字版</p>
                  <textarea className="form-control otoge-state-box" readOnly value={textualState} />
                  <button type="button" className="btn btn-outline-secondary mt-2" onClick={copyTextualState}>
                    复制文本框内容到剪贴板
                  </button>
                </div>

                <div className="d-flex flex-column gap-3 otoge-song-list">
                  {songStates.map((item) => (
                    <div key={`${item.song.title}-${item.song.artist}-${item.index}`}>
                      <div className="card otoge-song-card">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h2 className="h6 mb-0">{item.isShown ? item.song.title : `未揭晓曲目 #${item.index + 1}`}</h2>
                            <span className="badge text-bg-light">{item.song.level}</span>
                          </div>
                          <p className="text-secondary mb-2">
                            {item.isShown ? item.song.artist : 'Artist: ???'}
                          </p>
                          <div className="otoge-answer-box mb-2">
                            <p className="otoge-mask mb-0">
                              {item.isShown
                                ? item.song.title
                                : getMaskedTitleSegments(item.song.title, new Set(openedBySong[item.index] ?? [])).map(
                                    (segment, segmentIndex) => (
                                      <span key={`${item.index}-${segmentIndex}`} className={segment.className}>
                                        {segment.char}
                                      </span>
                                    ),
                                  )}
                            </p>
                          </div>
                          <div className="progress mb-3" role="progressbar" aria-label="曲目开字母进度">
                            <div
                              className={`progress-bar ${item.isCompleted ? 'bg-success' : ''}`}
                              style={{ width: `${Math.round((item.openedLetters / item.totalLetters) * 100)}%` }}
                            >
                              {item.openedLetters}/{item.totalLetters}
                            </div>
                          </div>
                          <div className="d-flex gap-2 flex-wrap">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-success"
                              onClick={() => revealSongFully(item.index)}
                            >
                              全部揭开
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {message && (
                  <div className="alert alert-info mt-3 mb-0" role="alert">
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-xl-10">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 p-lg-5">
                <h2 className="h5 mb-3">曲目池编辑</h2>
                <p className="text-secondary mb-2">每行格式：歌名|曲师|难度（仅歌名必填）。</p>
                <textarea
                  className="form-control otoge-pool-editor"
                  value={songPoolDraft}
                  onChange={(event) => setSongPoolDraft(event.target.value)}
                />
                <div className="d-flex gap-2 flex-wrap mt-3">
                  <button type="button" className="btn btn-primary" onClick={applySongPool}>
                    应用曲目池
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={resetSongPool}>
                    重置默认曲目池
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default OtogeLettersPage
