import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './index.css'

const CONTRACT_ADDRESS = "0x3372eaCB4b935D30e4d8aE4278d7EaE3371a87A3"

const CONTRACT_ABI = [
  "function cast(uint8 zodiac) external payable returns (uint8 rank)",
  "function jackpotBalance() external view returns (uint256)",
  "function totalMythicWins() external view returns (uint256)",
  "function marketingWallet() external view returns (address)",
  "function castFee() external view returns (uint256)",
  "event Cast(address indexed user, uint8 zodiac, uint8 rank)",
  "event MythicWin(address indexed user, uint256 amount)"
]

const zodiacData = {
  aries: { emoji: '<svg viewBox="0 0 40 40"><path d="M12 12 Q8 20 12 28 M28 12 Q32 20 28 28 M12 12 L20 20 M28 12 L20 20" fill="none" stroke="#2a1d0f" stroke-width="2.5" stroke-linecap="round"/></svg>', name: '白羊座' },
  taurus: { emoji: '<svg viewBox="0 0 40 40"><circle cx="20" cy="22" r="10" fill="none" stroke="#2a1d0f" stroke-width="2"/><path d="M12 14 Q10 10 14 8 M28 14 Q30 10 26 8" fill="none" stroke="#2a1d0f" stroke-width="2"/></svg>', name: '金牛座' },
  gemini: { emoji: '<svg viewBox="0 0 40 40"><path d="M14 12 L14 28 M26 12 L26 28" fill="none" stroke="#2a1d0f" stroke-width="3" stroke-linecap="round"/><circle cx="14" cy="10" r="4" fill="none" stroke="#2a1d0f" stroke-width="2"/><circle cx="26" cy="10" r="4" fill="none" stroke="#2a1d0f" stroke-width="2"/><circle cx="14" cy="30" r="4" fill="none" stroke="#2a1d0f" stroke-width="2"/><circle cx="26" cy="30" r="4" fill="none" stroke="#2a1d0f" stroke-width="2"/></svg>', name: '双子座' },
  cancer: { emoji: '<svg viewBox="0 0 40 40"><path d="M10 20 Q20 28 30 20 Q28 32 20 34 Q12 32 10 20" fill="none" stroke="#2a1d0f" stroke-width="2"/><path d="M8 12 Q10 8 14 10 M32 12 Q30 8 26 10" fill="none" stroke="#2a1d0f" stroke-width="2"/></svg>', name: '巨蟹座' },
  leo: { emoji: '<svg viewBox="0 0 40 40"><circle cx="20" cy="22" r="12" fill="none" stroke="#2a1d0f" stroke-width="2"/><path d="M8 14 L12 18 M32 14 L28 18 M6 8 Q4 6 6 4 M34 8 Q36 6 34 4 M14 6 L14 10 M26 6 L26 10" fill="none" stroke="#2a1d0f" stroke-width="2"/></svg>', name: '狮子座' },
  virgo: { emoji: '<svg viewBox="0 0 40 40"><path d="M20 8 L20 32 M12 14 L28 14 M14 24 L26 24" fill="none" stroke="#2a1d0f" stroke-width="2"/><path d="M16 8 Q20 4 24 8" fill="none" stroke="#2a1d0f" stroke-width="2"/></svg>', name: '处女座' },
  libra: { emoji: '<svg viewBox="0 0 40 40"><path d="M8 14 L32 26 M20 12 L20 28" fill="none" stroke="#2a1d0f" stroke-width="2"/><circle cx="20" cy="10" r="3" fill="#2a1d0f"/></svg>', name: '天秤座' },
  scorpio: { emoji: '<svg viewBox="0 0 40 40"><path d="M20 6 L20 22 L14 28 L26 34" fill="none" stroke="#2a1d0f" stroke-width="2" stroke-linecap="round"/><path d="M26 34 L32 36 M26 34 L28 40 M26 34 L22 38" fill="none" stroke="#2a1d0f" stroke-width="2"/></svg>', name: '天蝎座' },
  sagittarius: { emoji: '<svg viewBox="0 0 40 40"><path d="M10 28 L30 12 M26 8 L32 6 L30 12 M26 8 L30 4" fill="none" stroke="#2a1d0f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>', name: '射手座' },
  capricorn: { emoji: '<svg viewBox="0 0 40 40"><path d="M12 8 Q20 14 28 8 Q32 16 28 24 Q20 30 12 24 Q8 16 12 8" fill="none" stroke="#2a1d0f" stroke-width="2"/><path d="M28 8 L32 4 M28 8 L32 12" fill="none" stroke="#2a1d0f" stroke-width="2"/></svg>', name: '摩羯座' },
  aquarius: { emoji: '<svg viewBox="0 0 40 40"><path d="M10 12 Q15 8 20 12 Q25 16 30 12 M10 20 Q15 16 20 20 Q25 24 30 20" fill="none" stroke="#2a1d0f" stroke-width="2"/></svg>', name: '水瓶座' },
  pisces: { emoji: '<svg viewBox="0 0 40 40"><path d="M14 14 Q8 20 14 26 M26 14 Q32 20 26 26 M14 14 L26 26 M14 26 L26 14" fill="none" stroke="#2a1d0f" stroke-width="2" stroke-linecap="round"/></svg>', name: '双鱼座' }
}

const rankNames = ['普通', '稀有', '史诗', '传奇', '神话']
const rankEmojis = ['✨', '💎', '🔮', '👑', '🌟']
const rankColors = ['#8B7355', '#4A90D9', '#9B59B6', '#F39C12', '#E74C3C']

const fortunes = [
  "星星指引你今日会遇到意外的惊喜，保持开放的心态。",
  "宇宙的能量与你同在，今天适合做出重要的决定。",
  "贵人相助就在身边，勇敢迈出第一步吧。",
  "今晚的星空格外明亮，仿佛在诉说着你的命运。",
  "保持耐心，好事即将降临在你的生活中。",
  "命运的齿轮正在转动，你准备好了吗？",
  "新的机遇正在向你招手，不要错过。",
  "内心的声音会告诉你正确的方向。",
  "今天的你格外幸运，把握每一个机会。",
  "困难是暂时的，光明就在前方等待着你。",
  "相信自己，你比你想象的更强大。",
  "宇宙正在给你发送一个特别的信号。",
  "坚持你的梦想，它终将变成现实。",
  "今天适合与朋友相聚，友谊将带给你力量。",
  "倾听自己内心的声音，它会引导你走向成功。"
]

const playSound = (type, rank = null) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const gainNode = audioCtx.createGain()
    gainNode.connect(audioCtx.destination)
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)
    
    if (type === 'select') {
      const osc = audioCtx.createOscillator()
      osc.connect(gainNode)
      osc.frequency.setValueAtTime(600, audioCtx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12)
      osc.start(audioCtx.currentTime)
      osc.stop(audioCtx.currentTime + 0.12)
    } 
    else if (type === 'consult') {
      const osc = audioCtx.createOscillator()
      osc.type = 'sine'
      osc.connect(gainNode)
      osc.frequency.setValueAtTime(300, audioCtx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.3)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4)
      osc.start(audioCtx.currentTime)
      osc.stop(audioCtx.currentTime + 0.4)
    }
    else if (type === 'reveal') {
      for (let i = 0; i < 2; i++) {
        const osc = audioCtx.createOscillator()
        osc.type = 'sine'
        osc.connect(gainNode)
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + i * 0.2)
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime + i * 0.2)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.2 + 0.15)
        osc.start(audioCtx.currentTime + i * 0.2)
        osc.stop(audioCtx.currentTime + i * 0.2 + 0.15)
      }
    }
    else if (type === 'result') {
      const freqs = {
        0: [400, 500],
        1: [500, 600, 700],
        2: [600, 800, 1000],
        3: [523, 659, 784, 1047],
        4: [523, 659, 784, 1047, 1319]
      }
      const seq = freqs[rank] || freqs[0]
      seq.forEach((freq, i) => {
        const osc = audioCtx.createOscillator()
        osc.type = rank >= 3 ? 'triangle' : 'sine'
        osc.connect(gainNode)
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.12)
        const endTime = audioCtx.currentTime + i * 0.12 + 0.15
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime + i * 0.12)
        gainNode.gain.exponentialRampToValueAtTime(0.01, endTime)
        osc.start(audioCtx.currentTime + i * 0.12)
        osc.stop(endTime)
      })
    }
  } catch (e) {}
}

function App() {
  const [account, setAccount] = useState(null)
  const [contract, setContract] = useState(null)
  const [selectedZodiac, setSelectedZodiac] = useState(null)
  const [isConsulting, setIsConsulting] = useState(false)
  const [result, setResult] = useState(null)
  const [jackpot, setJackpot] = useState(100000000)
  const [mythicCount, setMythicCount] = useState(0)
  const [debug, setDebug] = useState('')

  const fetchJackpot = async () => {
    // 假数据：固定显示 100000000
    setJackpot(100000000)
    setMythicCount(0)
  }

  useEffect(() => {
    fetchJackpot()
  }, [])

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        const acc = await signer.getAddress()
        const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
        setAccount(acc)
        setContract(c)
        setDebug('钱包连接成功: ' + acc.slice(0,6) + '...')
      } catch (error) {
        setDebug('连接失败: ' + (error.reason || error.message))
      }
    } else {
      setDebug('请安装 MetaMask')
    }
  }

  const handleSelectZodiac = (zodiac) => {
    setSelectedZodiac(zodiac)
    setResult(null)
    playSound('select')
  }

  const handleConsult = async () => {
    if (!selectedZodiac) { setDebug('请先选择星座！'); return }
    if (!account) { setDebug('请先连接钱包！'); return }
    
    setIsConsulting(true)
    setResult(null)
    playSound('consult')
    setDebug('开始抽签...')
    
    try {
      const zodiacKeys = Object.keys(zodiacData)
      const zodiacIndex = zodiacKeys.indexOf(selectedZodiac)
      const signer = contract.provider.getSigner()
      const tx = await contract.connect(signer).cast(zodiacIndex, { value: ethers.utils.parseEther("0.002") })
      setDebug('交易已发送...')
      const receipt = await tx.wait()
      setDebug('占卜完成！')
      
      let rank = 0
      const castEvent = receipt.logs.find(log => {
        try { return log.topics[0] === ethers.utils.id("Cast(address,uint8,uint8)") } catch { return false }
      })
      
      if (castEvent && castEvent.data) {
        try {
          const iface = new ethers.utils.Interface(['event Cast(address indexed user, uint8 zodiac, uint8 rank)'])
          const parsed = iface.parseLog(castEvent)
          if (parsed) rank = parsed.args.rank.toNumber()
        } catch { rank = parseInt(castEvent.data.slice(-2), 16) }
      } else { rank = Math.floor(Math.random() * 5) }
      
      const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)]
      playSound('reveal')
      
      setTimeout(() => {
        setResult({ rank, fortune: randomFortune })
        playSound('result', rank)
      }, 400)
      
      fetchJackpot()
    } catch (error) {
      setDebug('抽签失败: ' + (error.reason || error.message || '未知错误'))
    }
    setIsConsulting(false)
  }

  return (
    <div className="app">
      <div className="overlay"></div>
      <div className="container">
        <header className="header">
          <div className="symbol">✧</div>
          <h1>星盘占卜</h1>
          <p>星辰为你揭示命运</p>
          <button className="wallet-btn" onClick={connectWallet} style={{position: 'absolute', top: '15px', right: '15px'}}>
            {account ? `${account.slice(0,6)}...${account.slice(-4)}` : '连接钱包'}
          </button>
        </header>
        
        {debug && (
          <div style={{textAlign: 'center', padding: '10px', background: '#f0f0f0', borderRadius: '5px', marginBottom: '15px', fontSize: '0.85em', color: '#333'}}>
            {debug}
          </div>
        )}
        
        <div className="main-content">
          <div className="left-panel">
            <div className="card">
              <h2 className="card-title">选择你的星座</h2>
              <div className="zodiac-grid">
                {Object.entries(zodiacData).map(([key, data]) => (
                  <button key={key} className={`zodiac-btn ${selectedZodiac === key ? 'active' : ''}`}
                    onClick={() => handleSelectZodiac(key)} title={data.name}
                    dangerouslySetInnerHTML={{ __html: data.emoji }} />
                ))}
              </div>
              <p className="chosen-text">
                {selectedZodiac ? `已选择：${zodiacData[selectedZodiac].name}` : '点击星座进行选择'}
              </p>
            </div>
            
            <div className="card result-section" style={{background: 'transparent', border: '1px solid rgba(92, 64, 51, 0.15)'}}>
              {!result && !isConsulting && (
                <div className="result-placeholder">
                  <span className="icon">🌟</span>
                  <p>凝视星盘，寻求启示</p>
                </div>
              )}
              
              {isConsulting && <div className="loading-spin"></div>}
              
              {result && (
                <div className="result-content">
                  <div className="result-symbol" dangerouslySetInnerHTML={{ __html: zodiacData[selectedZodiac].emoji }} />
                  <h2 className="result-title">{zodiacData[selectedZodiac].name} · 今日预言</h2>
                  
                  <div style={{marginTop: '20px'}}>
                    <div style={{fontSize: '3em'}}>{rankEmojis[result.rank]}</div>
                    <div style={{fontSize: '1.8em', fontWeight: 'bold', color: rankColors[result.rank], marginTop: '10px'}}>
                      {rankNames[result.rank]}
                    </div>
                  </div>
                  
                  <div style={{marginTop: '20px', padding: '15px', background: 'rgba(139, 105, 20, 0.08)', borderRadius: '8px', fontStyle: 'italic', color: '#5c4033', lineHeight: '1.6'}}>
                    「{result.fortune}」
                  </div>
                  
                  {result.rank === 4 && jackpot > 0 && (
                    <div style={{marginTop: '20px', padding: '15px', background: 'linear-gradient(135deg, rgba(231, 76, 60, 0.2), rgba(255, 107, 107, 0.2))', border: '2px solid #E74C3C', borderRadius: '10px', color: '#E74C3C', fontWeight: 'bold'}}>
                      🎉 获得奖池 50% 代币奖励！
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="right-panel">
            <div className="card wheel-section">
              <div className="zodiac-wheel">
                <div className="wheel-ring"></div>
                <div className="wheel-ring"></div>
                <div className="crystal-ball" onClick={handleConsult}>
                  <svg viewBox="0 0 30 30" width="30" height="30">
                    <circle cx="15" cy="15" r="8" fill="none" stroke="#2a1d0f" stroke-width="1.5"/>
                    <path d="M15 7 L15 15 L21 21" fill="none" stroke="#2a1d0f" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </div>
              </div>
              <p className="wheel-cost" style={{marginTop: '10px'}}>占卜费用: <span>0.002 BNB</span></p>
            </div>
            
            <div className="card stats-section">
              <h2 className="card-title">占卜统计</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{jackpot.toLocaleString()}</div>
                  <div className="stat-label">奖池 (FORTUNE)</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{mythicCount}</div>
                  <div className="stat-label">神话级</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{jackpot > 0 ? '50%' : '0%'}</div>
                  <div className="stat-label">下次奖励</div>
                </div>
              </div>
              
              <div className="rarity-section">
                <div className="rarity-card">
                  <h4>命运等级</h4>
                  <div className="rarity-row"><span>普通</span><span>85.9%</span></div>
                  <div className="rarity-row"><span>稀有</span><span>10%</span></div>
                  <div className="rarity-row"><span>史诗</span><span>3%</span></div>
                  <div className="rarity-row"><span>传奇</span><span>1%</span></div>
                  <div className="rarity-row"><span>神话</span><span>0.1%</span></div>
                </div>
                <div className="rarity-card">
                  <h4>奖池法则</h4>
                  <div className="jackpot-list">
                    <div className="jackpot-item">✦ 神话级赢取奖池 50%</div>
                    <div className="jackpot-item">✦ 50% BNB 回购代币存入奖池</div>
                    <div className="jackpot-item">✦ 50% BNB 进入营销钱包</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <footer className="footer">✦ 星辰与命运 ✦</footer>
      </div>
    </div>
  )
}

export default App
