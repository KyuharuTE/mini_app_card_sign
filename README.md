<div align="center">
    <h1> MINI APP CARD SIGN </h1>

[![Telegram](https://img.shields.io/static/v1?label=Telegram&message=Channel&color=0088cc)](https://t.me/nacho_nya)
[![Telegram](https://img.shields.io/static/v1?label=Telegram&message=Chat&color=0088cc)](https://t.me/nacho_chat)

签名小程序 ARK (图片地址不走腾讯代理服务器) 通过 [NapCatQQ](https://github.com/NapNeko/NapCatQQ)

</div>

# 简介

这是一个项目通过 NapCat 机器人获得签名后的小程序卡卡片

-   在 2025 年 10 月左右某大厂对各种 Ark 的图片连接添加了代理, 导致 iP 探针无法使用, 本项目绕过了这一点, 本项目生成的小程序卡卡片的图片连接依然是图片原连接

# 参考项目

-   [Packet-plugin](https://github.com/HDTianRu/Packet-plugin)
-   [NapCatQQ](https://github.com/NapNeko/NapCatQQ)

# 免责声明

-   使用此项目产生的一切后果由使用者承担
-   请勿用于盈利

# 如何使用

1. 安装 `NodeJs` 和 `pnpm`
2. 在项目文件夹下执行 `pnpm i`
3. 部署一个 `NapCatQQ` 并开放一个 `WebSocket` 服务端
4. 修改 `config.js`
5. 在项目文件夹下输入 `node ./index.js`

# 接口

```
POST /get_mini_app_card

请求
{
  "token": "", // config.js 文件设置的 token
  "pic_url": "https://qlogo.cn" // 图片链接
}

响应

- 正常响应
{
    "code": 0,
    "msg": "success.",
    "data": {
        "ark": "" // ark 卡片 json
    }
}

- Token 错误
{
    "code": -1,
    "msg": "token err.",
    "data": {}
}

```
