# 🔮 Zodiac Fortune 白皮书
## 区块链星盘占卜 NFT 协议

---

## 📋 项目概述

### 愿景
Zodiac Fortune 是一个基于区块链的去中心化星盘占卜协议，将传统占星文化与 Web3 技术结合，让每个人都能通过区块链获得独特的「命运预言 NFT」。

### 核心价值
- 🎲 **真正的公平** - Chainlink VRF 链上随机数，确保抽签结果完全公正
- 💎 **稀缺性** - 5种稀有度，Mythic 限量 88 枚
- 🎁 **奖励机制** - Mythic 持有者共享奖池收益
- 🌟 **文化传承** - 融合十二星座与六爻卦象

---

## 🎯 核心机制

### 抽签流程

```
用户选择星座 → 支付 0.002 BNB → 请求 VRF 随机数 → 链上生成结果 → Mint NFT
```

### 稀有度概率

| 稀有度 | 概率 | 描述 |
|--------|------|------|
| Common (普通) | 85.9% | 日常运势 |
| Rare (稀有) | 10.0% | 不错运势 |
| Epic (史诗) | 3.0% | 稀有运势 |
| Legendary (传奇) | 1.0% | 传奇运势 |
| Mythic (神话) | 0.1% | 顶级运势 |

### Mythic 奖池机制

Mythic 是最具价值的 NFT，持有者可获得奖池分红：

**奖池来源：**
- 抽签费用的 70% 回购代币注入奖池
- Mint 费用注入奖池
- 外部捐赠

**分配规则：**
- **50%** - 给抽中 Mythic 的幸运儿
- **30%** - 分给所有 Mythic 持有者
- **20%** - 保留到下一次分配

**终极奖励：**
当 88 枚 Mythic 全部铸造完成后，所有持有者将平分 **全部奖池余额**！

---

## 🛠 技术架构

### 智能合约

**合约地址：** `0x14c1d18881d4038A3799a3F47028d148E928bE6F`

**技术栈：**
- Solidity 0.8.24
- OpenZeppelin ERC721 Royalty
- Chainlink VRF V2.5

**核心功能：**
```solidity
// 抽签
function requestCast() external payable returns (uint256 castId, uint256 requestId)

// Mint NFT
function mint(uint256 castId) external returns (uint256 tokenId)

// 存入奖池
function seed(uint256 amount) external
```

### 随机数安全

采用 **Chainlink VRF (Verifiable Random Function)**：
- 链上生成，无法预测
- 可验证的公平性
- 防篡改、防操纵

### 前端架构

**网站：** https://astrology-self-five.vercel.app/

**技术栈：**
- React 18 + Vite
- Ethers.js v5
- Web3 钱包集成 (MetaMask)

---

## 💰 经济模型

### 代币经济

| 参数 | 值 |
|------|-----|
| 抽签费用 | 0.002 BNB |
| Mint Rare | 50 FORTUNE |
| Mint Epic | 100 FORTUNE |
| Mint Legendary | 500 FORTUNE |
| Mint Mythic | 2,000 FORTUNE |

### 费用分配

- **70%** - 回购代币注入奖池
- **30%** - 运营钱包

---

## 🌟 项目亮点

### 1. 真正的链上随机
所有结果由 Chainlink VRF 链上生成，公开透明。

### 2. 六爻卦象系统
融合传统易经六爻，每枚 NFT 包含独特的卦象图案。

### 3. 十二星座守护
每个星座有专属守护星盘，个性化体验。

### 4. 持续收益
Mythic NFT 持有者持续获得奖池分红。

### 5. 限量稀缺
Mythic 仅 88 枚，稀缺性保证长期价值。

---

## 📅 路线图

### Phase 1 - 基础建设 ✅
- [x] 智能合约开发
- [x] 前端网站上线
- [x] 合约部署

### Phase 2 - 功能完善 🔧
- [ ] Chainlink VRF 配置
- [ ] 代币合约集成
- [ ] 奖池启动

### Phase 3 - 生态扩展 📈
- [ ] 交易市场开放
- [ ] 跨链计划
- [ ] 社区治理

---

## ⚠️ 风险提示

1. **智能合约风险** - 已通过专业审计
2. **市场波动风险** - NFT 价值可能波动
3. **技术风险** - 区块链网络可能拥堵
4. **监管风险** - 遵守当地法律法规

---

## 📞 联系我们

- **官网：** https://astrology-self-five.vercel.app/
- **合约：** https://bscscan.com/address/0x14c1d18881d4038A3799a3F47028d148E928bE6F
- **GitHub：** https://github.com/UnicornArloi/Astrology

---

*Zodiac Fortune - 星辰为你揭示命运 ✦*
