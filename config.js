export default {
	bot: {
		baseUrl: "", // Napcat WebSocket 地址例如: ws://127.0.0.1:3001
		throwPromise: true,
		token: "", // 有的就填
		reconnection: {
			enable: true,
			attempts: 10,
			delay: 5000,
		},
	},
	web: {
		port: 6799, // 对外开放的 http 服务端口号
		token: "", // API Token
	},
};
