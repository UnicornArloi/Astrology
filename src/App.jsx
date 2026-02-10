import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './index.css'

const CONTRACT_ADDRESS = "0x7639245FF477B10c3D7DDc0dEE1F32ee351D670c"

const CONTRACT_ABI = [
  "function cast(uint8 zodiac) external payable returns (uint8 rank)",
  "function jackpotBalance() external view returns (uint256)",
  "function totalMythicWins() external view returns (uint256)",
  "function marketingWallet() external view returns (address)",
  "event Cast(address indexed user, uint8 zodiac, uint8 rank)",
  "event MythicWin(address indexed user, uint256 amount)"
]

const zodiacData = {
  aries: { name: '白羊座' },
  taurus: { name: '金牛座' },
  gemini: { name: '双子座' },
  cancer: { name: '巨蟹座' },
  leo: { name: '狮子座' },
  virgo: { name: '处女座' },
  libra: { name: '天秤座' },
  scorpio: { name: '天蝎座' },
  sagittarius: { name: '射手座' },
  capricorn: { name: '摩羯座' },
  aquarius: { name: '水瓶座' },
  pisces: { name: '双鱼座' }
}

const rankNames = ['普通', '稀有', '史诗', '传奇', '神话']
const rankEmojis = ['✨', '💎', '🔮', '👑', '🌟']
const rankColors = ['#8B7355', '#4A90D9', '#9B59B6', '#F39C12', '#E74C3C']

function App() {
  const [account, setAccount] = useState(null)
  const [contract, setContract] = useState(null)
  const [selectedZodiac, setSelectedZodiac] = useState(null)
  const [isConsulting, setIsConsulting] = useState(false)
  const [result, setResult] = useState(null)
  const [jackpot, setJackpot] = useState(0)
  const [mythicCount, setMythicCount] = useState(0)

  // 加载时查询奖池
  useEffect(() => {
    const fetchJackpot = async () => {
      try {
        const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/")
        const c = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
        const j = await c.jackpotBalance()
        const m = await c.totalMythicWins()
        setJackpot(parseFloat(ethers.utils.formatEther(j)))
        setMythicCount(m.toNumber())
      } catch (e) {
        console.log('查询奖池失败:', e.message)
      }
    }
    fetchJackpot()
    const interval = setInterval(fetchJackpot, 10000)
    return () => clearInterval(interval)
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
      } catch (error) {
        console.error('连接失败:', error)
        alert('连接失败: ' + error.message)
      }
    } else {
      alert('请安装 MetaMask')
    }
  }

  const handleSelectZodiac = (zodiac) => {
    setSelectedZodiac(zodiac)
    setResult(null)
  }

  const handleConsult = async () => {
    if (!selectedZodiac) {
      alert('请先选择星座！')
      return
    }
    if (!account) {
      alert('请先连接钱包！')
      return
    }
    
    setIsConsulting(true)
    setResult(null)
    
    try {
      const zodiacKeys = Object.keys(zodiacData)
      const zodiacIndex = zodiacKeys.indexOf(selectedZodiac)
      
      const c = contract.connect(window.ethereum.getSigner())
      const tx = await c.cast(zodiacIndex, { value: ethers.utils.parseEther("0.002") })
      await tx.wait()
      
      // 解析事件
      const receipt = await tx.wait()
      const castEvent = receipt.logs.find(log => {
        try {
          return log.topics[0] === ethers.utils.id("Cast(address,uint8,uint8)")
        } catch { return false }
      })
      
      let rank = 0
      if (castEvent) {
        rank = parseInt(castEvent.topics[3], 16)
      }
      
      setResult({ rank })
      setIsConsulting(false)
      
      // 刷新奖池
      const j = await contract.jackpotBalance()
      setJackpot(parseFloat(ethers.utils.formatEther(j)))
      
    } catch (error) {
      console.error('抽签失败:', error)
      alert('抽签失败: ' + (error.reason || error.message))
      setIsConsulting(false)
    }
  }

  return (
    <div className="app">
      <div className="overlay"></div>
      <div className="container">
        <header className="header">
          <div className="symbol">✧</div>
          <h1>星盘占卜</h1>
          <p>星辰为你揭示命运</p>
          <button className="wallet-btn" onClick={connectWallet}>
            {account ? `${account.slice(0,6)}...${account.slice(-4)}` : '连接钱包'}
          </button>
        </header>
        
        <div className="main-content">
          <div className="left-panel">
            <div className="card">
              <h2 className="card-title">选择你的星座</h2>
              <div className="zodiac-grid">
                {Object.entries(zodiacData).map(([key, data]) => (
                  <button
                    key={key}
                    className={`zodiac-btn ${selectedZodiac === key ? 'active' : ''}`}
                    onClick={() => handleSelectZodiac(key)}
                    title={data.name}
                  >
                    {key === 'aries' ? '♈' : key === 'taurus' ? '♉' : key === 'gemini' ? '♊' : 
                     key === 'cancer' ? '♋' : key === 'leo' ? '♌' : key === 'virgo' ? '♍' :
                     key === 'libra' ? '♎' : key === 'scorpio' ? '♏' : key === 'sagittarius' ? '♐' :
                     key === 'capricorn' ? '♑' : key === 'aquarius' ? '♒' : key === 'pisces' ? '♓' : '✦'}
                  </button>
                ))}
              </div>
              <p className="chosen-text">
                {selectedZodiac ? `已选择：${zodiacData[selectedZodiac].name}` : '点击星座进行选择'}
              </p>
            </div>
            
            <div className="card result-section">
              {!result && !isConsulting && (
                <div className="result-placeholder">
                  <span className="icon">🌟</span>
                  <p>凝视星盘，寻求启示</p>
                </div>
              )}
              
              {isConsulting && (
                <div className="loading-spin"></div>
              )}
              
              {result && (
                <div className="result-content">
                  <h2 className="result-title">
                    {selectedZodiac ? zodiacData[selectedZodiac].name : ''} · 今日预言
                  </h2>
                  
                  <div className="rank-display" style={{marginTop: '20px'}}>
                    <div className="rank-emoji" style={{fontSize: '3em'}}>{rankEmojis[result.rank]}</div>
                    <div className="rank-name" style={{
                      fontSize: '1.8em', 
                      fontWeight: 'bold',
                      color: rankColors[result.rank],
                      marginTop: '10px'
                    }}>
                      {rankNames[result.rank]}
                    </div>
                  </div>
                  
                  {result.rank === 4 && jackpot > 0 && (
                    <div className="mythic-reward" style={{
                      marginTop: '20px',
                      padding: '15px',
                      background: 'linear-gradient(135deg, rgba(231, 76, 60, 0.2), rgba(255, 107, 107, 0.2))',
                      border: '2px solid #E74C3C',
                      borderRadius: '10px',
                      color: '#E74C3C',
                      fontWeight: 'bold'
                    }}>
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
              <p className="wheel-cost">占卜费用: <span>0.002 BNB</span></p>
            </div>
            
            <div className="card stats-section">
              <h2 className="card-title">占卜统计</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{jackpot.toFixed(2)}</div>
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
        
        <footer className="footer">
          ✦ 星辰与命运 ✦
        </footer>
      </div>
    </div>
  )
}

export default App
