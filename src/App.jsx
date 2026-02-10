import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { ethers } from 'ethers'
import './index.css'

// 合约配置
const CONTRACT_ADDRESS = "0x7639245FF477B10c3D7DDc0dEE1F32ee351D670c"

const CONTRACT_ABI = [
  "function cast(uint8 zodiac) external payable returns (uint8 rank)",
  "function jackpotBalance() external view returns (uint256)",
  "function totalMythicWins() external view returns (uint256)",
  "function marketingWallet() external view returns (address)",
  "event Cast(address indexed user, uint8 zodiac, uint8 rank)",
  "event MythicWin(address indexed user, uint256 amount)"
]


const rankConfig = {
  0: { name: '普通', emoji: '✨', color: '#8B7355', bg: 'linear-gradient(135deg, #8B7355 0%, #A0826D 100%)', desc: '命运的平凡馈赠' },
  1: { name: '稀有', emoji: '💎', color: '#4A90D9', bg: 'linear-gradient(135deg, #4A90D9 0%, #6BB3F0 100%)', desc: '命运藏匿的珍宝' },
  2: { name: '史诗', emoji: '🔮', color: '#9B59B6', bg: 'linear-gradient(135deg, #9B59B6 0%, #BE7DD8 100%)', desc: '命运的珍贵馈赠' },
  3: { name: '传奇', emoji: '👑', color: '#F39C12', bg: 'linear-gradient(135deg, #F39C12 0%, #F1C40F 100%)', desc: '命运的最高眷顾' },
  4: { name: '神话', emoji: '🌟', color: '#E74C3C', bg: 'linear-gradient(135deg, #E74C3C 0%, #FF6B6B 100%)', desc: '命运的终极启示' }
}

// 星座数据
const zodiacData = {
  aries: { 
    emoji: '<svg viewBox="0 0 40 40"><path d="M12 12 Q8 20 12 28 M28 12 Q32 20 28 28 M12 12 L20 20 M28 12 L20 20" fill="none" stroke="#2a1d0f" stroke-width="2.5" stroke-linecap="round"/></svg>', 
    name: '白羊座' 
  },
  taurus: { 
    emoji: '<svg viewBox="0 0 40 40"><circle cx="20" cy="22" r="10" fill="none" stroke="#2a1d0f" stroke-width="2"/><path d="M12 14 Q10 10 14 8 M28 14 Q30 10 26 8" fill="none" stroke="#2a1d0f" stroke-width="2"/></svg>', 
    name: '金牛座' 
  },
  gemini: { 
    emoji: '<svg viewBox="0 0 40 40"><path d="M14 12 L14 28 M26 12 L26 28" fill="none" stroke="#2a1d0f" stroke-width="3" stroke-linecap="round"/><circle cx="14" cy="10" r="4" fill="none" stroke="#2a1d0f" stroke-width="2"/><circle cx="26" cy="10" r="4" fill="none" stroke="#2a1d0f" stroke-width="2"/><circle cx="14" cy="30" r="4" fill="none" stroke="#2a1d0f" stroke-width="2"/><circle cx="26" cy="30" r="4" fill="none" stroke="#2a1d0f" stroke-width="2"/></svg>', 
    name: '双子座' 
  },
  cancer: { 
    emoji: '<svg viewBox="0 0 40 40"><path d="M10 20 Q20 28 30 20 Q28 32 20 34 Q12 32 10 20" fill="none" stroke="#2a1d0f" stroke-width="2"/><path d="M8 12 Q10 8 14 10 M32 12 Q30 8 26 10" fill="none" stroke="#2a1d0f" stroke-width="2"/></svg>', 
    name: '巨蟹座' 
  },
  leo: { 
    emoji: '<svg viewBox="0 0 40 40"><circle cx="20" cy="22" r="12" fill="none" stroke="#2a1d0f" stroke-width="2"/><path d="M8 14 L12 18 M32 14 L28 18 M6 8 Q4 6 6 4 M34 8 Q36 6 34 4 M14 6 L14 10 M26 6 L26 10" fill="none" stroke="#2a1d0f" stroke-width="2"/></svg>', 
    name: '狮子座' 
  },
  virgo: { 
    emoji: '<svg viewBox="0 0 40 40"><path d="M20 8 L20 32 M12 14 L28 14 M14 24 L26 24" fill="none" stroke="#2a1d0f" stroke-width="2"/><path d="M16 8 Q20 4 24 8" fill="none" stroke="#2a1d0f" stroke-width="2"/></svg>', 
    name: '处女座' 
  },
  libra: { 
    emoji: '<svg viewBox="0 0 40 40"><path d="M8 14 L32 26 M20 12 L20 28" fill="none" stroke="#2a1d0f" stroke-width="2"/><circle cx="20" cy="10" r="3" fill="#2a1d0f"/></svg>', 
    name: '天秤座' 
  },
  scorpio: { 
    emoji: '<svg viewBox="0 0 40 40"><path d="M20 6 L20 22 L14 28 L26 34" fill="none" stroke="#2a1d0f" stroke-width="2" stroke-linecap="round"/><path d="M26 34 L32 36 M26 34 L28 40 M26 34 L22 38" fill="none" stroke="#2a1d0f" stroke-width="2"/></svg>', 
    name: '天蝎座' 
  },
  sagittarius: { 
    emoji: '<svg viewBox="0 0 40 40"><path d="M10 28 L30 12 M26 8 L32 6 L30 12 M26 8 L30 4" fill="none" stroke="#2a1d0f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>', 
    name: '射手座' 
  },
  capricorn: { 
    emoji: '<svg viewBox="0 0 40 40"><path d="M12 8 Q20 14 28 8 Q32 16 28 24 Q20 30 12 24 Q8 16 12 8" fill="none" stroke="#2a1d0f" stroke-width="2"/><path d="M28 8 L32 4 M28 8 L32 12" fill="none" stroke="#2a1d0f" stroke-width="2"/></svg>', 
    name: '摩羯座' 
  },
  aquarius: { 
    emoji: '<svg viewBox="0 0 40 40"><path d="M10 12 Q15 8 20 12 Q25 16 30 12 M10 20 Q15 16 20 20 Q25 24 30 20" fill="none" stroke="#2a1d0f" stroke-width="2"/></svg>', 
    name: '水瓶座' 
  },
  pisces: { 
    emoji: '<svg viewBox="0 0 40 40"><path d="M14 14 Q8 20 14 26 M26 14 Q32 20 26 26 M14 14 L26 26 M14 26 L26 14" fill="none" stroke="#2a1d0f" stroke-width="2" stroke-linecap="round"/></svg>', 
    name: '双鱼座' 
  }
}

// rankNames 已移至 rankConfig
// rankClasses 已移至 rankConfig

function App() {
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [account, setAccount] = useState(null)
  const [contract, setContract] = useState(null)
  const [selectedZodiac, setSelectedZodiac] = useState(null)
  const [isConsulting, setIsConsulting] = useState(false)
  const [result, setResult] = useState(null)
  const [isMinting, setIsMinting] = useState(false)
  const [stats, setStats] = useState({ jackpot: 0, mythicCount: 0, totalCast: 0 })
  const [castId, setCastId] = useState(null)

  // 连接钱包
  const connectWallet = useCallback(async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        const account = await signer.getAddress()
        
        // 检查并切换到 BSC 网络
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x38' }], // BSC Mainnet
          })
        } catch (switchError) {
          // 如果 BSC 网络不存在，添加它
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x38',
                  chainName: 'BNB Smart Chain',
                  rpcUrls: ['https://bsc-dataseed.binance.org/'],
                  blockExplorerUrls: ['https://bscscan.com/'],
                  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 }
                }]
              })
            } catch (addError) {
              console.error('添加网络失败:', addError)
              alert('请手动添加 BNB Smart Chain 网络')
            }
          }
        }
        
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
        
        setProvider(provider)
        setSigner(signer)
        setAccount(account)
        setContract(contract)
        
        // 监听账户变化
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            setAccount(accounts[0])
            setSigner(provider.getSigner())
          } else {
            setAccount(null)
            setSigner(null)
          }
        })
        
        

  // 页面加载时查询奖池（无需连接钱包）
  useEffect(() => {
    const fetchJackpot = async () => {
      try {
        const provider = new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/")
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
        const jackpot = await contract.jackpotBalance()
        const mythicCount = await contract.totalMythicWins()
        setStats({
          jackpot: parseFloat(ethers.utils.formatEther(jackpot)),
          mythicCount: mythicCount.toNumber(),
          totalCast: 0
        })
      } catch (e) {
        console.log('查询奖池失败（无需钱包）:', e.message)
      }
    }
    fetchJackpot()
    const interval = setInterval(fetchJackpot, 10000) // 每10秒刷新
    return () => clearInterval(interval)
  }, [])

  // 更新统计
        await updateStats(contract)
      } catch (error) {
        console.error('连接失败:', error)
        alert('连接失败: ' + error.message)
      }
    } else {
      alert('请安装 MetaMask 钱包')
    }
  }, [])

  // 更新统计
  const updateStats = async (contractInstance) => {
    try {
      console.log('=== 查询奖池 ===')
      console.log('合约地址:', CONTRACT_ADDRESS)
      
      const jackpot = await contractInstance.jackpotBalance()
      console.log('奖池 (Raw):', jackpot.toString())
      
      const mythicCount = await contractInstance.totalMythicWins()
      console.log('神话次数:', mythicCount.toString())
      
      setStats({
        jackpot: parseFloat(ethers.utils.formatEther(jackpot)),
        mythicCount: mythicCount.toNumber(),
        totalCast: 0
      })
      console.log('奖池 (FORTUNE):', parseFloat(ethers.utils.formatEther(jackpot)))
    } catch (error) {
      console.error('更新统计失败:', error)
      console.error('可能是合约 ABI 不匹配')
    }
  }

  // 选择星座
  const handleSelectZodiac = (zodiac) => {
    setSelectedZodiac(zodiac)
    setResult(null)
    setCastId(null)
  }

  // 抽签
  const handleConsult = async () => {
    if (!selectedZodiac) {
      alert('请先选择星座！')
      return
    }
    if (!account) {
      alert('请先连接钱包！')
      return
    }
    
    console.log('=== 开始抽签测试 ===')
    console.log('1. 合约地址:', CONTRACT_ADDRESS)
    console.log('2. 账户:', account)
    console.log('3. 签名者:', signer ? '已连接' : '未连接')
    console.log('4. 合约:', contract ? '已初始化' : '未初始化')
    
    if (!contract || !signer) {
      alert('合约未初始化，请重新连接钱包！')
      return
    }
    
    // 获取星座索引
    const zodiacKeys = Object.keys(zodiacData)
    const zodiacIndex = zodiacKeys.indexOf(selectedZodiac)
    
    setIsConsulting(true)
    setResult(null)
    
    try {
      console.log('5. 准备发送交易...')
      console.log('6. 星座索引:', zodiacIndex, selectedZodiac)
      const contractWithSigner = contract.connect(signer)
      
      const tx = await contractWithSigner.cast(zodiacIndex, { 
        value: ethers.utils.parseEther("0.002") 
      })
      console.log('7. 交易已发送，Hash:', tx.hash)
      
      const receipt = await tx.wait()
      console.log('8. 交易已确认!', receipt.status === 1 ? '成功' : '失败')
      
      // 解析事件获取 rank
      const castEvent = receipt.logs.find(log => {
        try {
          return log.topics[0] === ethers.utils.id("Cast(address,uint8,uint8)")
        } catch { return false }
      })
      
      let rank = 0
      if (castEvent) {
        rank = parseInt(castEvent.topics[3], 16)
        console.log('9. 抽中稀有度:', rank)
      }
      
      // 显示结果
      setResult({ luck: 50 + rank * 10, rank: rank })
      setIsConsulting(false)
      // 显示结果（不用 alert）
      setResult({ luck: 50 + rank * 10, rank: rank })
      setIsConsulting(false)
      
    } catch (error) {
      console.error('❌ 抽签失败:', error)
      alert('抽签失败: ' + (error.reason || error.message || error.code || '未知错误'))
      setIsConsulting(false)
    }
  }

  // Mint NFT
  const handleMint = async () => {
    if (!castId || !account) return
    
    setIsMinting(true)
    
    try {
      const contractWithSigner = contract.connect(signer)
      const tx = await contractWithSigner.mint(castId)
      await tx.wait()
      
      alert('铭刻成功！NFT 已铸造！')
      await updateStats(contract)
    } catch (error) {
      console.error('Mint失败:', error)
      alert('铭刻失败: ' + error.message)
    }
    
    setIsMinting(false)
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
                    dangerouslySetInnerHTML={{ __html: data.emoji }}
                  />
                ))}
              </div>
              <p className="chosen-text">
                {selectedZodiac ? `已选择：${zodiacData[selectedZodiac].name}` : '点击星座印记进行选择'}
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
                  <div 
                    className="result-symbol" 
                    dangerouslySetInnerHTML={{ __html: zodiacData[selectedZodiac].emoji }}
                  />
                  <h2 className="result-title">
                    {zodiacData[selectedZodiac].name} · 今日预言
                  </h2>
                  
                  <div className="score-row">
                    <div className="score-circle">{result.luck}</div>
                    <div className="score-info">
                      <div className="label">命运指数</div>
                      <div className="desc">星辰所示</div>
                    </div>
                  </div>
                  
                  <div className="rank-card rank-${result.rank}">
                    <div className="rank-emoji">{rankConfig[result.rank].emoji}</div>
                    <div className="rank-info">
                      <div className="rank-name" style={{color: rankConfig[result.rank].color}}>{rankConfig[result.rank].name}</div>
                      <div className="rank-desc">{rankConfig[result.rank].desc}</div>
                    </div>
                    <div className="rank-glow"></div>
                  </div>

                  {result.rank === 4 && (
                    <div className="mythic-reward">
                      🎉 获得奖池 50% 代币奖励！
                    </div>
                  )}
                  
                  {result.rank > 0 && (
                    <button 
                      className="action-btn" 
                      onClick={handleMint}
                      disabled={isMinting}
                    >
                      {isMinting ? '铭刻中...' : '✦ 铭刻命运'}
                    </button>
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
                  <div className="stat-value">{stats.jackpot.toFixed(2)}</div>
                  <div className="stat-label">奖池 (FORTUNE)</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{stats.mythicCount}</div>
                  <div className="stat-label">神话级</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{stats.jackpot > 0 ? '50%' : '0%'}</div>
                  <div className="stat-label">下次奖励</div>
                </div>
              </div>
              
              <div className="rarity-section">
                <div className="rarity-card">
                  <h4>命运等级</h4>
                  <div className="rarity-row">
                    <span>普通</span><span>85.9%</span>
                  </div>
                  <div className="rarity-row">
                    <span>稀有</span><span>10%</span>
                  </div>
                  <div className="rarity-row">
                    <span>史诗</span><span>3%</span>
                  </div>
                  <div className="rarity-row">
                    <span>传奇</span><span>1%</span>
                  </div>
                  <div className="rarity-row">
                    <span>神话</span><span>0.1%</span>
                  </div>
                </div>
                
                <div className="rarity-card">
                  <h4>奖池法则</h4>
                  <div className="jackpot-list">
                    <div className="jackpot-item">✦ 神话级赢取奖池</div>
                    <div className="jackpot-item">✦ 50% 归预言者</div>
                    <div className="jackpot-item">✦ 30% 分予持有者</div>
                    <div className="jack-item">✦ 88枚齐聚平分</div>
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
