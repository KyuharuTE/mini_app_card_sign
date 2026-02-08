function openModal(text, loading = false) {
	document.getElementById("modalText").textContent = text;
	document.getElementById("modal").style.display = "flex";

	document.getElementById("modalSpinner").style.display = loading
		? "block"
		: "none";

	document.getElementById("modalClose").style.display = loading
		? "none"
		: "block";
}

window.closeModal = function () {
	document.getElementById("modal").style.display = "none";
};

window.copyModalText = function () {
	const text = document.getElementById("modalText").textContent;

	navigator.clipboard
		.writeText(text)
		.then(() => {
			openModal("已复制到剪贴板");
		})
		.catch(() => {
			alert("复制失败");
		});
};

function bytesToHex(bytes) {
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

import { NCWebsocket } from "node-napcat-ts";
import pb from "./protobuf/index.js";

/**
 * @type {NCWebsocket}
 */
var napcat = null;

window.connectWS = async function () {
	const wsUrl = document.getElementById("wsUrl"),
		token = document.getElementById("token");

	openModal("正在连接…", true);

	try {
		napcat = new NCWebsocket(
			{
				baseUrl: wsUrl.value,
				accessToken: token.value,
				throwPromise: true,
				reconnection: {
					enable: true,
					attempts: 10,
					delay: 5000,
				},
			},
			false,
		);

		await napcat.connect();
		openModal("连接成功");
	} catch (e) {
		openModal("连接失败:\n" + e);
	}
};

window.signData = async function () {
	if (napcat == null) {
		openModal("请先连接 NapCat");
		return;
	}

	openModal("正在签名…", true);

	const encoded = pb.encode({
		1: 31,
		2: "V1_PC_MINISDK_99.99.99_1_APP_A",
		4: {
			2: document.getElementById("appid").value,
			3: document.getElementById("title").value,
			4: document.getElementById("desc").value,
			5: 1766234860,
			6: 0,
			7: 0,
			8: 0,
			9: {},
			11: document.getElementById("path").value,
			12: {},
			13: 3,
			14: 0,
			15: "7dacbc0639d1cf283e23f8f0dbc28c27",
			16: 0,
			19: {
				1: document.getElementById("templateId").value,
				2: document
					.getElementById("templateData")
					.value.replace('"', '\\"'),
			},
			22: 0,
		},
		5: (await napcat.get_login_info()).user_id + "_0621001900828_44861",
	});

	const mRes = JSON.parse(
		pb.decode(
			await napcat.send_packet({
				cmd: "LightAppSvc.mini_app_share.AdaptShareInfo",
				data: bytesToHex(encoded),
			}),
		)["4"]["2"],
	);

	const ark = {
		ver: mRes.ver,
		prompt: mRes.prompt,
		config: mRes.config,
		app: mRes.appName,
		view: mRes.appView,
		meta: mRes.metaData,
		miniappShareOrigin: 3,
		miniappOpenRefer: "10002",
	};

	openModal(JSON.stringify(ark, null, 2));
};
