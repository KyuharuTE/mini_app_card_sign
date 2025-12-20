import { logger, NCWebsocket } from "node-napcat-ts";
import express from "express";
import cors from "cors";
import config from "./config.js";
import pb from "./protobuf/index.js";

const napcat = new NCWebsocket(config.bot);

await napcat.connect();

logger.debug("Napcat connected.");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/get_mini_app_card", async (req, res) => {
	try {
		const { token, pic_url } = req.body;

		if (token != config.web.token) {
			return res
				.status(403)
				.send({ code: -1, msg: "token err.", data: {} });
		}

		const mRes = JSON.parse(
			pb.decode(
				await napcat.send_packet({
					cmd: "LightAppSvc.mini_app_share.AdaptShareInfo",
					data: Buffer.from(
						pb.encode({
							1: 31,
							2: "V1_PC_MINISDK_99.99.99_1_APP_A",
							4: {
								2: "1109937557",
								3: "awa",
								4: "awa",
								5: 1766234860,
								6: 0,
								7: 0,
								8: 0,
								9: {},
								11: "pages/",
								12: {},
								13: 3,
								14: 0,
								15: "7dacbc0639d1cf283e23f8f0dbc28c27",
								16: 0,
								19: {
									1: "472ADE9D43609B0F5AB20E86B765EEA3",
									2:
										'{\n  "bottomBtnTxt": "awa",\n  "giftList": [\n    {\n      "giftName": "awa",\n      "giftImg": "' +
										pic_url +
										'"\n    }\n  ]\n}\n',
								},
								22: 0,
							},
							5:
								(await napcat.get_login_info()).user_id +
								"_0621001900828_44861",
						})
					).toString("hex"),
				})
			)["4"]["2"]
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

		res.send({
			code: 0,
			msg: "success.",
			data: { ark: JSON.stringify(ark) },
		});
	} catch (error) {
		logger.warn(error);
	}
});

app.listen(config.web.port, () => {
	logger.debug("Http Sever Started on :" + config.web.port);
});
