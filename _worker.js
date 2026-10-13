
// 部署完成后在网址后面加上这个，获取自建节点和机场聚合节点，/?token=auto或/auto或

let mytoken = 'auto';
let guestToken = ''; //可以随便取，或者uuid生成，https://1024tools.com/uuid
let BotToken = ''; //可以为空，或者@BotFather中输入/start，/newbot，并关注机器人
let ChatID = ''; //可以为空，或者@userinfobot中获取，/start
let TG = 0; //小白勿动， 开发者专用，1 为推送所有的访问信息，0 为不推送订阅转换后端的访问信息与异常访问
let FileName = 'CF-Workers-SUB';
let SUBUpdateTime = 6; //自定义订阅更新时间，单位小时
let total = 99;//TB
let timestamp = 4102329600000;//2099-12-31

//节点链接 + 订阅链接
let MainData = `
https://cfxr.eu.org/getSub
`;

let urls = [];
let subConverter = "SUBAPI.cmliussss.net"; //在线订阅转换后端，目前使用CM的订阅转换功能。支持自建psub 可自行搭建https://github.com/bulianglin/psub
let subConfig = "https://raw.githubusercontent.com/cmliu/ACL4SSR/main/Clash/config/ACL4SSR_Online_MultiCountry.ini"; //订阅配置文件
let subProtocol = 'https';

export default {
	async fetch(request, env, ctx) {
		const userAgentHeader = request.headers.get('User-Agent');
		const userAgent = userAgentHeader ? userAgentHeader.toLowerCase() : "null";
		const url = new URL(request.url);
		const token = url.searchParams.get('token');
		mytoken = env.TOKEN || mytoken;
		BotToken = env.TGTOKEN || BotToken;
		ChatID = env.TGID || ChatID;
		TG = env.TG || TG;
		subConverter = env.SUBAPI || subConverter;
		if (subConverter.includes("http://")) {
			subConverter = subConverter.split("//")[1];
			subProtocol = 'http';
		} else {
			subConverter = subConverter.split("//")[1] || subConverter;
		}
		subConfig = env.SUBCONFIG || subConfig;
		FileName = env.SUBNAME || FileName;

		const currentDate = new Date();
		currentDate.setHours(0, 0, 0, 0);
		const timeTemp = Math.ceil(currentDate.getTime() / 1000);
		const fakeToken = await MD5MD5(`${mytoken}${timeTemp}`);
		guestToken = env.GUESTTOKEN || env.GUEST || guestToken;
		if (!guestToken) guestToken = await MD5MD5(mytoken);
		const 访客订阅 = guestToken;
		//console.log(`${fakeUserID}\n${fakeHostName}`); // 打印fakeID

		let UD = Math.floor(((timestamp - Date.now()) / timestamp * total * 1099511627776) / 2);
		total = total * 1099511627776;
		let expire = Math.floor(timestamp / 1000);
		SUBUpdateTime = env.SUBUPTIME || SUBUpdateTime;

		if (!([mytoken, fakeToken, 访客订阅].includes(token) || url.pathname == ("/" + mytoken) || url.pathname.includes("/" + mytoken + "?"))) {
			if (TG == 1 && url.pathname !== "/" && url.pathname !== "/favicon.ico") ctx.waitUntil(日志记录(env, request, url, FileName, '异常访问', userAgentHeader, TG == 1));
			if (env.URL302) return Response.redirect(env.URL302, 302);
			else if (env.URL) return await proxyURL(env.URL, url);
			else return new Response(await nginx(), {
				status: 200,
				headers: {
					'Content-Type': 'text/html; charset=UTF-8',
				},
			});
		} else {
			if (env.KV) {
				await 迁移地址列表(env, 'LINK.txt');
				if (userAgent.includes('mozilla') && !url.search) {
					ctx.waitUntil(日志记录(env, request, url, FileName, '编辑订阅', userAgentHeader, true));
					return await KV(request, env, 'LINK.txt', 访客订阅);
				} else {
					MainData = await env.KV.get('LINK.txt') || MainData;
				}
			} else {
				MainData = env.LINK || MainData;
				if (env.LINKSUB) urls = await ADD(env.LINKSUB);
			}
			let 重新汇总所有链接 = await ADD(MainData + '\n' + urls.join('\n'));
			let 自建节点 = "";
			let 订阅链接 = "";
			for (let x of 重新汇总所有链接) {
				if (x.toLowerCase().startsWith('http')) {
					订阅链接 += x + '\n';
				} else {
					自建节点 += x + '\n';
				}
			}
			MainData = 自建节点;
			urls = await ADD(订阅链接);
			ctx.waitUntil(日志记录(env, request, url, FileName, '获取订阅', userAgentHeader, true));
			const isSubConverterRequest = request.headers.get('subconverter-request') || request.headers.get('subconverter-version') || userAgent.includes('subconverter');
			let 订阅格式 = 'base64';
			if (!(userAgent.includes('null') || isSubConverterRequest || userAgent.includes('nekobox') || userAgent.includes(('CF-Workers-SUB').toLowerCase()))) {
				if (userAgent.includes('sing-box') || userAgent.includes('singbox') || url.searchParams.has('sb') || url.searchParams.has('singbox')) {
					订阅格式 = 'singbox';
				} else if (userAgent.includes('surge') || url.searchParams.has('surge')) {
					订阅格式 = 'surge';
				} else if (userAgent.includes('quantumult') || url.searchParams.has('quanx')) {
					订阅格式 = 'quanx';
				} else if (userAgent.includes('loon') || url.searchParams.has('loon')) {
					订阅格式 = 'loon';
				} else if (userAgent.includes('clash') || userAgent.includes('meta') || userAgent.includes('mihomo') || url.searchParams.has('clash')) {
					订阅格式 = 'clash';
				}
			}

			let subConverterUrl;
			let 订阅转换URL = `${url.origin}/${await MD5MD5(fakeToken)}?token=${fakeToken}`;
			//console.log(订阅转换URL);
			let req_data = MainData;

			let 追加UA = 'v2rayn';
			if (url.searchParams.has('b64') || url.searchParams.has('base64')) 订阅格式 = 'base64';
			else if (url.searchParams.has('clash')) 追加UA = 'clash';
			else if (url.searchParams.has('singbox')) 追加UA = 'singbox';
			else if (url.searchParams.has('surge')) 追加UA = 'surge';
			else if (url.searchParams.has('quanx')) 追加UA = 'Quantumult%20X';
			else if (url.searchParams.has('loon')) 追加UA = 'Loon';

			const 订阅链接数组 = [...new Set(urls)].filter(item => item?.trim?.()); // 去重
			if (订阅链接数组.length > 0) {
				const 请求订阅响应内容 = await getSUB(订阅链接数组, request, 追加UA, userAgentHeader);
				console.log(请求订阅响应内容);
				req_data += 请求订阅响应内容[0].join('\n');
				订阅转换URL += "|" + 请求订阅响应内容[1];
				if (订阅格式 == 'base64' && !isSubConverterRequest && 请求订阅响应内容[1].includes('://')) {
					subConverterUrl = `${subProtocol}://${subConverter}/sub?target=mixed&url=${encodeURIComponent(请求订阅响应内容[1])}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
					try {
						const subConverterResponse = await fetch(subConverterUrl, { headers: { 'User-Agent': 'v2rayN/CF-Workers-SUB  (https://github.com/cmliu/CF-Workers-SUB)' } });
						if (subConverterResponse.ok) {
							const subConverterContent = await subConverterResponse.text();
							req_data += '\n' + atob(subConverterContent);
						}
					} catch (error) {
						console.log('订阅转换请回base64失败，检查订阅转换后端是否正常运行');
					}
				}
			}

			if (env.WARP) 订阅转换URL += "|" + (await ADD(env.WARP)).join("|");
			//修复中文错误
			const utf8Encoder = new TextEncoder();
			const encodedData = utf8Encoder.encode(req_data);
			//const text = String.fromCharCode.apply(null, encodedData);
			const utf8Decoder = new TextDecoder();
			const text = utf8Decoder.decode(encodedData);

			//去重
			const uniqueLines = new Set(text.split('\n'));
			const result = [...uniqueLines].join('\n');
			//console.log(result);

			let base64Data;
			try {
				base64Data = btoa(result);
			} catch (e) {
				function encodeBase64(data) {
					const binary = new TextEncoder().encode(data);
					let base64 = '';
					const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

					for (let i = 0; i < binary.length; i += 3) {
						const byte1 = binary[i];
						const byte2 = binary[i + 1] || 0;
						const byte3 = binary[i + 2] || 0;

						base64 += chars[byte1 >> 2];
						base64 += chars[((byte1 & 3) << 4) | (byte2 >> 4)];
						base64 += chars[((byte2 & 15) << 2) | (byte3 >> 6)];
						base64 += chars[byte3 & 63];
					}

					const padding = 3 - (binary.length % 3 || 3);
					return base64.slice(0, base64.length - padding) + '=='.slice(0, padding);
				}

				base64Data = encodeBase64(result)
			}

			// 构建响应头对象
			const responseHeaders = {
				"content-type": "text/plain; charset=utf-8",
				"Profile-Update-Interval": `${SUBUpdateTime}`,
				"Profile-web-page-url": request.url.includes('?') ? request.url.split('?')[0] : request.url,
				//"Subscription-Userinfo": `upload=${UD}; download=${UD}; total=${total}; expire=${expire}`,
			};

			if (订阅格式 == 'base64' || token == fakeToken) {
				return new Response(base64Data, { headers: responseHeaders });
			} else if (订阅格式 == 'clash') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=clash&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'singbox') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=singbox&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'surge') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=surge&ver=4&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;
			} else if (订阅格式 == 'quanx') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=quanx&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&udp=true`;
			} else if (订阅格式 == 'loon') {
				subConverterUrl = `${subProtocol}://${subConverter}/sub?target=loon&url=${encodeURIComponent(订阅转换URL)}&insert=false&config=${encodeURIComponent(subConfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false`;
			}
			//console.log(订阅转换URL);
			try {
				const subConverterResponse = await fetch(subConverterUrl, { headers: { 'User-Agent': userAgentHeader } });//订阅转换
				if (!subConverterResponse.ok) return new Response(base64Data, { headers: responseHeaders });
				let subConverterContent = await subConverterResponse.text();
				if (订阅格式 == 'clash') subConverterContent = await clashFix(subConverterContent);
				// 只有非浏览器订阅才会返回SUBNAME
				if (!userAgent.includes('mozilla')) responseHeaders["Content-Disposition"] = `attachment; filename*=utf-8''${encodeURIComponent(FileName)}`;
				return new Response(subConverterContent, { headers: responseHeaders });
			} catch (error) {
				return new Response(base64Data, { headers: responseHeaders });
			}
		}
	}
};

async function ADD(envadd) {
	var addtext = envadd.replace(/[	"'|\r\n]+/g, '\n').replace(/\n+/g, '\n');	// 替换为换行
	//console.log(addtext);
	if (addtext.charAt(0) == '\n') addtext = addtext.slice(1);
	if (addtext.charAt(addtext.length - 1) == '\n') addtext = addtext.slice(0, addtext.length - 1);
	const add = addtext.split('\n');
	//console.log(add);
	return add;
}

async function nginx() {
	const text = `
	<!DOCTYPE html>
	<html>
	<head>
	<title>Welcome to nginx!</title>
	<style>
		body {
			width: 35em;
			margin: 0 auto;
			font-family: Tahoma, Verdana, Arial, sans-serif;
		}
	</style>
	</head>
	<body>
	<h1>Welcome to nginx!</h1>
	<p>If you see this page, the nginx web server is successfully installed and
	working. Further configuration is required.</p>
	
	<p>For online documentation and support please refer to
	<a href="http://nginx.org/">nginx.org</a>.<br/>
	Commercial support is available at
	<a href="http://nginx.com/">nginx.com</a>.</p>
	
	<p><em>Thank you for using nginx.</em></p>
	</body>
	</html>
	`
	return text;
}

async function 日志记录(env, request, url, 订阅名 = FileName, 请求类型 = '获取订阅', userAgentHeader = '', enableTG = false) {
	try {
		const 访问IP = request.headers.get('CF-Connecting-IP') || request.headers.get('True-Client-IP') || request.headers.get('X-Real-IP') || request.headers.get('X-Forwarded-For') || '未知IP';
		const 当前时间 = new Date();
		const cf = request.cf || {};
		const 国家 = cf.country || 'N/A', 城市 = cf.city || 'N/A';
		const ASN = `AS${cf.asn || '0'} ${cf.asOrganization || 'Unknown'}`;

		// ---- Telegram 通知（对齐 _worker2.js 的样式，保留 _worker.js 的环境变量配置方式） ----
		// enableTG 由调用方传入（对应 _worker.js 原有的 TG==1 触发语义）；若配置了 BotToken/ChatID 才发送
		if (enableTG && BotToken !== '' && ChatID !== '') {
			try {
				const 请求时间 = 当前时间.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
				const msg = `<b>#${订阅名} 日志通知</b>\n\n` +
					`📌 <b>类型：</b>#${请求类型}\n` +
					`🌐 <b>IP：</b><code>${访问IP}</code>\n` +
					`📍 <b>位置：</b>${国家} ${城市}\n` +
					`🏢 <b>ASN：</b>${ASN}\n` +
					`🔗 <b>域名：</b><code>${url.hostname}</code>\n` +
					`🔍 <b>路径：</b><code>${url.pathname + url.search}</code>\n` +
					`🤖 <b>UA：</b><code>${userAgentHeader}</code>\n` +
					`📅 <b>时间：</b>${请求时间}\n`;
				await fetch(`https://api.telegram.org/bot${BotToken}/sendMessage?chat_id=${ChatID}&parse_mode=HTML&text=${encodeURIComponent(msg)}`, {
					method: 'GET',
					headers: {
						'Accept': 'text/html,application/xhtml+xml,application/xml;',
						'Accept-Encoding': 'gzip, deflate, br',
						'User-Agent': userAgentHeader || 'Mozilla/5.0 Chrome/90.0.4430.72'
					}
				});
			} catch (error) {
				console.error('发送TG通知出错:', error.message);
			}
		}

		// ---- 写入 KV 日志 log.json（对齐 _worker2.js：30分钟去重 + 4MB容量控制） ----
		if (!env.KV || typeof env.KV.get !== 'function') return;
		try {
			const 日志内容 = {
				TYPE: 请求类型, IP: 访问IP, ASN, CC: `${国家} ${城市}`,
				URL: request.url, UA: userAgentHeader || 'Unknown', TIME: 当前时间.getTime()
			};
			let 日志数组 = [];
			const 现有日志 = await env.KV.get('log.json'), KV容量限制 = 4;//MB
			if (现有日志) {
				try {
					日志数组 = JSON.parse(现有日志);
					if (!Array.isArray(日志数组)) { 日志数组 = [日志内容]; }
					else {
						// 30分钟内相同IP/URL/UA且类型非订阅的请求去重
						const 三十分钟前时间戳 = 当前时间.getTime() - 30 * 60 * 1000;
						const 已存在 = 日志数组.some(log => log.IP === 访问IP && log.URL === request.url && log.UA === userAgentHeader && log.TIME >= 三十分钟前时间戳);
						if (已存在) return;
						日志数组.push(日志内容);
						while (JSON.stringify(日志数组, null, 2).length > KV容量限制 * 1024 * 1024 && 日志数组.length > 0) 日志数组.shift();
					}
				} catch (e) { 日志数组 = [日志内容]; }
			} else { 日志数组 = [日志内容]; }
			await env.KV.put('log.json', JSON.stringify(日志数组, null, 2));
		} catch (error) {
			console.error('写入KV日志失败:', error.message);
		}
	} catch (error) {
		console.error('日志记录失败:', error.message);
	}
}

function base64Decode(str) {
	const bytes = new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)));
	const decoder = new TextDecoder('utf-8');
	return decoder.decode(bytes);
}

async function MD5MD5(text) {
	const encoder = new TextEncoder();

	const firstPass = await crypto.subtle.digest('MD5', encoder.encode(text));
	const firstPassArray = Array.from(new Uint8Array(firstPass));
	const firstHex = firstPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

	const secondPass = await crypto.subtle.digest('MD5', encoder.encode(firstHex.slice(7, 27)));
	const secondPassArray = Array.from(new Uint8Array(secondPass));
	const secondHex = secondPassArray.map(b => b.toString(16).padStart(2, '0')).join('');

	return secondHex.toLowerCase();
}

function clashFix(content) {
	if (content.includes('wireguard') && !content.includes('remote-dns-resolve')) {
		let lines;
		if (content.includes('\r\n')) {
			lines = content.split('\r\n');
		} else {
			lines = content.split('\n');
		}

		let result = "";
		for (let line of lines) {
			if (line.includes('type: wireguard')) {
				const 备改内容 = `, mtu: 1280, udp: true`;
				const 正确内容 = `, mtu: 1280, remote-dns-resolve: true, udp: true`;
				result += line.replace(new RegExp(备改内容, 'g'), 正确内容) + '\n';
			} else {
				result += line + '\n';
			}
		}

		content = result;
	}
	return content;
}

async function proxyURL(proxyURL, url) {
	const URLs = await ADD(proxyURL);
	const fullURL = URLs[Math.floor(Math.random() * URLs.length)];

	// 解析目标 URL
	let parsedURL = new URL(fullURL);
	console.log(parsedURL);
	// 提取并可能修改 URL 组件
	let URLProtocol = parsedURL.protocol.slice(0, -1) || 'https';
	let URLHostname = parsedURL.hostname;
	let URLPathname = parsedURL.pathname;
	let URLSearch = parsedURL.search;

	// 处理 pathname
	if (URLPathname.charAt(URLPathname.length - 1) == '/') {
		URLPathname = URLPathname.slice(0, -1);
	}
	URLPathname += url.pathname;

	// 构建新的 URL
	let newURL = `${URLProtocol}://${URLHostname}${URLPathname}${URLSearch}`;

	// 反向代理请求
	let response = await fetch(newURL);

	// 创建新的响应
	let newResponse = new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: response.headers
	});

	// 添加自定义头部，包含 URL 信息
	//newResponse.headers.set('X-Proxied-By', 'Cloudflare Worker');
	//newResponse.headers.set('X-Original-URL', fullURL);
	newResponse.headers.set('X-New-URL', newURL);

	return newResponse;
}

async function getSUB(api, request, 追加UA, userAgentHeader) {
	if (!api || api.length === 0) {
		return [];
	} else api = [...new Set(api)]; // 去重
	let newapi = "";
	let 订阅转换URLs = "";
	let 异常订阅 = "";
	const controller = new AbortController(); // 创建一个AbortController实例，用于取消请求
	const timeout = setTimeout(() => {
		controller.abort(); // 2秒后取消所有请求
	}, 2000);

	try {
		// 使用Promise.allSettled等待所有API请求完成，无论成功或失败
		const responses = await Promise.allSettled(api.map(apiUrl => getUrl(request, apiUrl, 追加UA, userAgentHeader).then(response => response.ok ? response.text() : Promise.reject(response))));

		// 遍历所有响应
		const modifiedResponses = responses.map((response, index) => {
			// 检查是否请求成功
			if (response.status === 'rejected') {
				const reason = response.reason;
				if (reason && reason.name === 'AbortError') {
					return {
						status: '超时',
						value: null,
						apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
					};
				}
				console.error(`请求失败: ${api[index]}, 错误信息: ${reason.status} ${reason.statusText}`);
				return {
					status: '请求失败',
					value: null,
					apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
				};
			}
			return {
				status: response.status,
				value: response.value,
				apiUrl: api[index] // 将原始的apiUrl添加到返回对象中
			};
		});

		console.log(modifiedResponses); // 输出修改后的响应数组

		for (const response of modifiedResponses) {
			// 检查响应状态是否为'fulfilled'
			if (response.status === 'fulfilled') {
				const content = await response.value || 'null'; // 获取响应的内容
				if (content.includes('proxies:')) {
					//console.log('Clash订阅: ' + response.apiUrl);
					订阅转换URLs += "|" + response.apiUrl; // Clash 配置
				} else if (content.includes('outbounds"') && content.includes('inbounds"')) {
					//console.log('Singbox订阅: ' + response.apiUrl);
					订阅转换URLs += "|" + response.apiUrl; // Singbox 配置
				} else if (content.includes('://')) {
					//console.log('明文订阅: ' + response.apiUrl);
					newapi += content + '\n'; // 追加内容
				} else if (isValidBase64(content)) {
					//console.log('Base64订阅: ' + response.apiUrl);
					newapi += base64Decode(content) + '\n'; // 解码并追加内容
				} else {
					const 异常订阅LINK = `trojan://CMLiussss@127.0.0.1:8888?security=tls&allowInsecure=1&type=tcp&headerType=none#%E5%BC%82%E5%B8%B8%E8%AE%A2%E9%98%85%20${response.apiUrl.split('://')[1].split('/')[0]}`;
					console.log('异常订阅: ' + 异常订阅LINK);
					异常订阅 += `${异常订阅LINK}\n`;
				}
			}
		}
	} catch (error) {
		console.error(error); // 捕获并输出错误信息
	} finally {
		clearTimeout(timeout); // 清除定时器
	}

	const 订阅内容 = await ADD(newapi + 异常订阅); // 将处理后的内容转换为数组
	// 返回处理后的结果
	return [订阅内容, 订阅转换URLs];
}

async function getUrl(request, targetUrl, 追加UA, userAgentHeader) {
	// 设置自定义 User-Agent
	const newHeaders = new Headers(request.headers);
	newHeaders.set("User-Agent", `${atob('djJyYXlOLzYuNDU=')} cmliu/CF-Workers-SUB ${追加UA}(${userAgentHeader})`);

	// 构建新的请求对象
	const modifiedRequest = new Request(targetUrl, {
		method: request.method,
		headers: newHeaders,
		body: request.method === "GET" ? null : request.body,
		redirect: "follow",
		cf: {
			// 忽略SSL证书验证
			insecureSkipVerify: true,
			// 允许自签名证书
			allowUntrusted: true,
			// 禁用证书验证
			validateCertificate: false
		}
	});

	// 输出请求的详细信息
	console.log(`请求URL: ${targetUrl}`);
	console.log(`请求头: ${JSON.stringify([...newHeaders])}`);
	console.log(`请求方法: ${request.method}`);
	console.log(`请求体: ${request.method === "GET" ? null : request.body}`);

	// 发送请求并返回响应
	return fetch(modifiedRequest);
}

function isValidBase64(str) {
	// 先移除所有空白字符(空格、换行、回车等)
	const cleanStr = str.replace(/\s/g, '');
	const base64Regex = /^[A-Za-z0-9+/=]+$/;
	return base64Regex.test(cleanStr);
}

async function 迁移地址列表(env, txt = 'ADD.txt') {
	const 旧数据 = await env.KV.get(`/${txt}`);
	const 新数据 = await env.KV.get(txt);

	if (旧数据 && !新数据) {
		// 写入新位置
		await env.KV.put(txt, 旧数据);
		// 删除旧数据
		await env.KV.delete(`/${txt}`);
		return true;
	}
	return false;
}

async function KV(request, env, txt = 'ADD.txt', guest) {
    const url = new URL(request.url);
    try {
        // POST请求处理
        if (request.method === "POST") {
            if (!env.KV) return new Response("未绑定KV空间", { status: 400 });
            try {
                const content = await request.text();
                await env.KV.put(txt, content);
                return new Response("保存成功");
            } catch (error) {
                console.error('保存KV时发生错误:', error);
                return new Response("保存失败: " + error.message, { status: 500 });
            }
        }
        // GET请求部分
        let content = '';
        let hasKV = !!env.KV;
        if (hasKV) {
            try {
                content = await env.KV.get(txt) || '';
            } catch (error) {
                console.error('读取KV时发生错误:', error);
                content = '读取数据时发生错误: ' + error.message;
            }
        }
        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${FileName} 订阅编辑</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        :root {
                            --bg0: #0f172a;
                            --bg1: #1e293b;
                            --bg2: #334155;
                            --card: rgba(255, 255, 255, 0.055);
                            --card-border: rgba(255, 255, 255, 0.10);
                            --line: rgba(255, 255, 255, 0.08);
                            --txt: #e2e8f0;
                            --muted: #94a3b8;
                            --accent: #38bdf8;
                            --accent2: #818cf8;
                            --accent3: #c084fc;
                            --grad: linear-gradient(135deg, #38bdf8, #818cf8 55%, #c084fc);
                            --ok: #34d399;
                            --warn: #fbbf24;
                            --err: #f87171;
                            --radius: 16px;
                            --shadow: 0 20px 45px rgba(2, 6, 23, 0.55);
                        }
                        * { box-sizing: border-box; }
                        body {
                            margin: 0;
                            min-height: 100vh;
                            padding: 24px 14px;
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", Roboto, Helvetica, Arial, sans-serif;
                            font-size: 14px;
                            line-height: 1.6;
                            color: var(--txt);
                            background:
                                radial-gradient(900px 520px at 15% -8%, rgba(129, 140, 248, 0.22), transparent 60%),
                                radial-gradient(820px 460px at 100% 0%, rgba(56, 189, 248, 0.18), transparent 55%),
                                radial-gradient(760px 620px at 50% 120%, rgba(192, 132, 252, 0.14), transparent 55%),
                                linear-gradient(135deg, var(--bg0), var(--bg1) 52%, var(--bg0));
                            background-attachment: fixed;
                        }
                        .page {
                            max-width: 1080px;
                            margin: 0 auto;
                        }
                        /* ---------- Hero ---------- */
                        .hero {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            flex-wrap: wrap;
                            gap: 16px;
                            padding: 26px 22px;
                            margin-bottom: 20px;
                            background: var(--card);
                            border: 1px solid var(--card-border);
                            border-radius: var(--radius);
                            backdrop-filter: blur(12px);
                            box-shadow: var(--shadow);
                        }
                        .brand { display: flex; align-items: center; gap: 16px; }
                        .logo {
                            width: 52px; height: 52px;
                            display: grid; place-items: center;
                            font-size: 28px;
                            border-radius: 14px;
                            background: var(--grad);
                            box-shadow: 0 8px 22px rgba(129, 140, 248, 0.45);
                        }
                        .hero h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: .5px; }
                        .grad { background: var(--grad); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
                        .tagline { margin: 3px 0 0; color: var(--muted); font-size: 13px; }
                        .pill {
                            display: inline-flex; align-items: center; gap: 6px;
                            padding: 6px 14px;
                            font-size: 12px; font-weight: 600;
                            border-radius: 999px;
                            background: rgba(56, 189, 248, 0.14);
                            border: 1px solid rgba(56, 189, 248, 0.35);
                            color: #7dd3fc;
                        }
                        .notice-bar {
                            display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
                            padding: 10px 16px;
                            margin-bottom: 20px;
                            font-size: 12.5px;
                            border-radius: 12px;
                            background: rgba(251, 191, 36, 0.10);
                            border: 1px solid rgba(251, 191, 36, 0.30);
                            color: #fde68a;
                        }
                        .notice-bar code { padding: 2px 7px; border-radius: 6px; background: rgba(2,6,23,.4); }
                        /* ---------- Grid ---------- */
                        .stack { display: flex; flex-direction: column; gap: 20px; }
                        .stack > * { min-width: 0; }
                        /* ---------- Card ---------- */
                        .card {
                            padding: 20px 22px;
                            background: var(--card);
                            border: 1px solid var(--card-border);
                            border-radius: var(--radius);
                            backdrop-filter: blur(12px);
                            box-shadow: var(--shadow);
                        }
                        .card + .card, .card + .ua { margin-top: 20px; }
                        .card-head {
                            display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;
                            font-size: 15px; font-weight: 700;
                            margin-bottom: 4px;
                        }
                        .card-sub { margin: 0 0 14px; color: var(--muted); font-size: 12.5px; }
                        .muted { color: var(--muted); }
                        .warn {
                            padding: 8px 12px; margin: 8px 0 12px;
                            font-size: 12.5px; color: #fde68a;
                            border-radius: 10px;
                            background: rgba(251, 191, 36, 0.10);
                            border: 1px solid rgba(251, 191, 36, 0.28);
                        }
                        /* ---------- Link rows ---------- */
                        .link-list { display: flex; flex-direction: column; gap: 10px; }
                        .link-row {
                            display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
                            padding: 10px 12px;
                            border-radius: 12px;
                            background: rgba(15, 23, 42, 0.55);
                            border: 1px solid var(--line);
                            transition: border-color .18s ease, transform .18s ease, background .18s ease;
                        }
                        .link-row:hover { border-color: rgba(129,140,248,.45); background: rgba(15,23,42,.8); transform: translateY(-1px); }
                        .chip {
                            flex: 0 0 auto;
                            min-width: 64px; text-align: center;
                            padding: 4px 9px;
                            font-size: 11.5px; font-weight: 700; letter-spacing: .3px;
                            border-radius: 8px;
                        }
                        .chip-auto   { background: linear-gradient(135deg,#0ea5e9,#6366f1); color:#fff; }
                        .chip-b64    { background: rgba(52,211,153,.16); color:#6ee7b7; border:1px solid rgba(52,211,153,.35); }
                        .chip-clash  { background: rgba(249,115,22,.16);  color:#fdba74; border:1px solid rgba(249,115,22,.35); }
                        .chip-singbox{ background: rgba(244,63,94,.16);  color:#fda4af; border:1px solid rgba(244,63,94,.35); }
                        .chip-surge  { background: rgba(168,85,247,.16);  color:#d8b4fe; border:1px solid rgba(168,85,247,.35); }
                        .chip-quanx  { background: rgba(234,179,8,.16);   color:#fde047; border:1px solid rgba(234,179,8,.35); }
                        .chip-loon   { background: rgba(14,165,233,.16);  color:#7dd3fc; border:1px solid rgba(14,165,233,.35); }
                        .link-btn {
                            flex: 1 1 280px;
                            display: block; text-align: left;
                            padding: 6px 10px;
                            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
                            font-size: 12px; color: #bae6fd;
                            background: rgba(2, 6, 23, 0.5);
                            border: 1px solid rgba(56,189,248,.25);
                            border-radius: 8px;
                            cursor: pointer;
                            overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                            transition: border-color .18s ease;
                        }
                        .link-btn:hover { border-color: rgba(56,189,248,.65); color:#7dd3fc; }
                        .qr {
                            display: grid; place-items: center;
                            margin-top: 8px; padding: 10px;
                            width: 100%;
                            background: rgba(2,6,23,.45);
                            border: 1px solid var(--line);
                            border-radius: 12px;
                        }
                        .qr:empty { display: none; }
                        /* ---------- Config dl ---------- */
                        dl { margin: 8px 0 0; }
                        dl > div { padding: 10px 0; border-bottom: 1px dashed var(--line); }
                        dl > div:last-child { border-bottom: none; }
                        dt { font-size: 12px; color: var(--muted); margin-bottom: 2px; letter-spacing: .3px; }
                        dd {
                            margin: 0; font-size: 13px;
                            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
                            color: #a5f3fc; word-break: break-all;
                        }
                        /* ---------- Editor ---------- */
                        .editor-container { width: 100%; }
                        .editor {
                            width: 100%; height: 280px;
                            margin: 12px 0;
                            padding: 12px;
                            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
                            font-size: 12.5px; line-height: 1.6;
                            color: #d1fae5;
                            background: rgba(2, 6, 23, 0.6);
                            border: 1px solid var(--line);
                            border-radius: 12px;
                            resize: vertical;
                        }
                        .editor:focus { outline: none; border-color: rgba(129,140,248,.55); }
                        .save-container { display: flex; align-items: center; gap: 12px; }
                        .save-btn, .back-btn {
                            padding: 9px 22px;
                            font-size: 13px; font-weight: 700; color: #fff;
                            border: none; border-radius: 10px; cursor: pointer;
                            transition: filter .18s ease, transform .12s ease;
                        }
                        .save-btn {
                            background: linear-gradient(135deg,#10b981,#34d399);
                            box-shadow: 0 8px 20px rgba(16,185,129,.35);
                        }
                        .save-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
                        .save-btn:disabled { filter: grayscale(.5); cursor: not-allowed; transform: none; }
                        .back-btn { background: #475569; }
                        .back-btn:hover { background: #64748b; }
                        .save-status { color: var(--muted); font-size: 12.5px; }
                        /* ---------- Footer ---------- */
                        .ua {
                            padding: 12px 18px;
                            font-size: 12px; color: var(--muted);
                            background: var(--card);
                            border: 1px solid var(--card-border);
                            border-radius: 12px;
                            backdrop-filter: blur(10px);
                            word-break: break-all;
                        }
                        .ua code { color: #94a3b8; }
                        .toggle-btn {
                            background: none; border: 1px solid rgba(192,132,252,.35); color:#d8b4fe;
                            padding: 5px 12px; border-radius: 999px; cursor: pointer; font-size: 12px; font-weight: 600;
                        }
                        .toggle-btn:hover { background: rgba(192,132,252,.12); }
                        ::selection { background: rgba(129,140,248,.4); }
                    </style>
                    <script src="https://cdn.jsdelivr.net/npm/@keeex/qrcodejs-kx@1.0.2/qrcode.min.js"></script>
                </head>
                <body>
                    <div class="page">
                        <header class="hero">
                            <div class="brand">
                                <div class="logo">🚀</div>
                                <div>
                                    <h1>CF Workers <span class="grad">SUB</span></h1>
                                    <p class="tagline">订阅聚合 · 格式转换 · 边缘加速</p>
                                </div>
                            </div>
                            <span class="pill">👋 访客模式</span>
                        </header>

                        <div class="notice-bar">
                            <span>⚠️ 访客订阅只能使用订阅功能，无法查看配置页！</span>
                            <span style="margin-left:auto">GUEST TOKEN：<code>${guest}</code></span>
                        </div>

                        <main class="stack">
                            <!-- 汇聚订阅编辑 -->
                            <section class="card">
                                <div class="card-head">📝 ${FileName} 汇聚订阅编辑</div>
                                <p class="card-sub">在此维护自建节点与订阅链接清单</p>
                                <div class="editor-container">
                                    ${hasKV ? `
                                    <textarea class="editor"
                                        placeholder="${decodeURIComponent(atob('TElOSyVFNyVBNCVCQSVFNCVCRSU4QiVFRiVCQyU4OCVFNCVCOCU4MCVFOCVBMSU4QyVFNCVCOCU4MCVFNiU5RCVBMSVFOCVBRSVBMiVFOSU5OCU4NSVFOSU5MyVCRSVFNiU4RSVBNSVFNSU4RCVCMyVFNSU4RiVBRiVFRiVCQyU4OSVFRiVCQyU5QQp2bGVzcyUzQSUyRiUyRjI0NmFhNzk1LTA2MzctNGY0Yy04ZjY0LTJjOGZiMjRjMWJhZCU0MDEyNy4wLjAuMSUzQTEyMzQlM0ZlbmNyeXB0aW9uJTNEbm9uZSUyNnNlY3VyaXR5JTNEdGxzJTI2c25pJTNEVEcuQ01MaXVzc3NzLmxvc2V5b3VyaXAuY29tJTI2YWxsb3dJbnNlY3VyZSUzRDElMjZ0eXBlJTNEd3MlMjZob3N0JTNEVEcuQ01MaXVzc3NzLmxvc2V5b3VyaXAuY29tJTI2cGF0aCUzRCUyNTJGJTI1M0ZlZCUyNTNEMjU2MCUyM0NGbmF0CnRyb2phbiUzQSUyRiUyRmFhNmRkZDJmLWQxY2YtNGE1Mi1iYTFiLTI2NDBjNDFhNzg1NiU0MDIxOC4xOTAuMjMwLjIwNyUzQTQxMjg4JTNGc2VjdXJpdHklM0R0bHMlMjZzbmklM0RoazEyLmJpbGliaWxpLmNvbSUyNmFsbG93SW5zZWN1cmUlM0QxJTI2dHlwZSUzRHRjcCUyNmhlYWRlclR5cGUlM0Rub25lJTIzSEsKc3MlM0ElMkYlMkZZMmhoWTJoaE1qQXRhV1YwWmkxd2IyeDVNVE13TlRveVJYUlFjVzQyU0ZscVZVNWpTRzlvVEdaVmNFWlJkMjVtYWtORFVUVnRhREZ0U21SRlRVTkNkV04xVjFvNVVERjFaR3RTUzBodVZuaDFielUxYXpGTFdIb3lSbTgyYW5KbmRERTRWelkyYjNCMGVURmxOR0p0TVdwNlprTm1RbUklMjUzRCU0MDg0LjE5LjMxLjYzJTNBNTA4NDElMjNERQoKCiVFOCVBRSVBMiVFOSU5OCU4NSVFOSU5MyVCRSVFNiU4RSVBNSVFNyVBNCVCQSVFNCVCRSU4QiVFRiVCQyU4OCVFNCVCOCU4MCVFOCVBMSU4QyVFNCVCOCU4MCVFNiU5RCVBMSVFOCVBRSVBMiVFOSU5OCU4NSVFOSU5MyVCRSVFNiU4RSVBNSVFNSU4RCVCMyVFNSU4RiVBRiVFRiVCQyU4OSVFRiVCQyU5QQpodHRwcyUzQSUyRiUyRnN1Yi54Zi5mcmVlLmhyJTJGYXV0bw=='))}"
                                        id="content">${content}</textarea>
                                    <div class="save-container">
                                        <button class="save-btn" onclick="saveContent(this)">保存</button>
                                        <span class="save-status" id="saveStatus"></span>
                                    </div>
                                    ` : '<div class="warn">请绑定 <strong>变量名称</strong> 为 <strong>KV</strong> 的 KV 命名空间以启用在线编辑</div>'}
                                </div>
                            </section>

                            <!-- 访客订阅地址 -->
                            <section class="card">
                                <div class="card-head">🔗 访客订阅地址</div>
                                <p class="card-sub">点击订阅地址自动复制，并生成对应二维码</p>
                                <div class="link-list">
                                    <div class="link-row">
                                        <span class="chip chip-auto">自适应</span>
                                        <button class="link-btn" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}','guest_0')">https://${url.hostname}/sub?token=${guest}</button>
                                    </div>
                                    <div class="qr" id="guest_0"></div>
                                    <div class="link-row">
                                        <span class="chip chip-b64">Base64</span>
                                        <button class="link-btn" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&b64','guest_1')">https://${url.hostname}/sub?token=${guest}&amp;b64</button>
                                    </div>
                                    <div class="qr" id="guest_1"></div>
                                    <div class="link-row">
                                        <span class="chip chip-clash">Clash</span>
                                        <button class="link-btn" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&clash','guest_2')">https://${url.hostname}/sub?token=${guest}&amp;clash</button>
                                    </div>
                                    <div class="qr" id="guest_2"></div>
                                    <div class="link-row">
                                        <span class="chip chip-singbox">sing-box</span>
                                        <button class="link-btn" onclick="copyToClipboard('https://${url.hostname}/sub?token=${guest}&sb','guest_3')">https://${url.hostname}/sub?token=${guest}&amp;sb</button>
                                    </div>
                                    <div class="qr" id="guest_3"></div>
                                </div>
                            </section>

                            <!-- 配置订阅 -->
                            <section class="card">
                                <div class="card-head">
                                    <span>🔐 配置订阅</span>
                                    <button class="toggle-btn" id="noticeToggle" onclick="toggleNotice()">查看配置订阅 ∨</button>
                                </div>
                                <p class="card-sub">使用管理员 TOKEN 的完整配置订阅</p>
                                <div id="noticeContent" class="notice-content" style="display: none;">
                                    <div class="warn">⚠️ 配置订阅地址会导致配置页泄露，请谨慎分享！</div>
                                    <div class="link-list">
                                        <div class="link-row">
                                            <span class="chip chip-auto">自适应</span>
                                            <button class="link-btn" onclick="copyToClipboard('https://${url.hostname}/${mytoken}','qrcode_0')">https://${url.hostname}/${mytoken}</button>
                                        </div>
                                        <div class="qr" id="qrcode_0"></div>
                                        <div class="link-row">
                                            <span class="chip chip-b64">Base64</span>
                                            <button class="link-btn" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?b64','qrcode_1')">https://${url.hostname}/${mytoken}?b64</button>
                                        </div>
                                        <div class="qr" id="qrcode_1"></div>
                                        <div class="link-row">
                                            <span class="chip chip-clash">Clash</span>
                                            <button class="link-btn" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?clash','qrcode_2')">https://${url.hostname}/${mytoken}?clash</button>
                                        </div>
                                        <div class="qr" id="qrcode_2"></div>
                                        <div class="link-row">
                                            <span class="chip chip-singbox">sing-box</span>
                                            <button class="link-btn" onclick="copyToClipboard('https://${url.hostname}/${mytoken}?sb','qrcode_3')">https://${url.hostname}/${mytoken}?sb</button>
                                        </div>
                                        <div class="qr" id="qrcode_3"></div>
                                    </div>
                                </div>
                            </section>

                            <!-- 订阅转换配置 -->
                            <section class="card">
                                <div class="card-head">⚙️ 订阅转换配置</div>
                                <p class="card-sub">在线订阅转换后端与规则配置</p>
                                <dl>
                                    <div>
                                        <dt>SUBAPI（订阅转换后端）</dt>
                                        <dd>${subProtocol}://${subConverter}</dd>
                                    </div>
                                    <div>
                                        <dt>SUBCONFIG（订阅转换配置文件）</dt>
                                        <dd>${subConfig}</dd>
                                    </div>
                                </dl>
                            </section>

                            <div class="ua">UA：<code>${request.headers.get('User-Agent')}</code></div>
                        </main>
                    </div>
                    <script>
                    function copyToClipboard(text, qrcode) {
                        navigator.clipboard.writeText(text).then(() => {
                            alert('已复制到剪贴板');
                        }).catch(err => {
                            console.error('复制失败:', err);
                        });
                        const qrcodeDiv = document.getElementById(qrcode);
                        qrcodeDiv.innerHTML = '';
                        new QRCode(qrcodeDiv, {
                            text: text,
                            width: 220,
                            height: 220,
                            colorDark: "#000000",
                            colorLight: "#ffffff",
                            correctLevel: QRCode.CorrectLevel.Q,
                            scale: 1
                        });
                    }

                    if (document.querySelector('.editor')) {
                        let timer;
                        const textarea = document.getElementById('content');
                        const originalContent = textarea.value;

                        function goBack() {
                            const currentUrl = window.location.href;
                            const parentUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
                            window.location.href = parentUrl;
                        }

                        function replaceFullwidthColon() {
                            const text = textarea.value;
                            textarea.value = text.replace(/：/g, ':');
                        }

                        function saveContent(button) {
                            try {
                                const updateButtonText = (step) => {
                                    button.textContent = \`保存中: \${step}\`;
                                };
                                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

                                if (!isIOS) {
                                    replaceFullwidthColon();
                                }
                                updateButtonText('开始保存');
                                button.disabled = true;
                                const textarea = document.getElementById('content');
                                if (!textarea) {
                                    throw new Error('找不到文本编辑区域');
                                }
                                updateButtonText('获取内容');
                                let newContent;
                                let originalContent;
                                try {
                                    newContent = textarea.value || '';
                                    originalContent = textarea.defaultValue || '';
                                } catch (e) {
                                    console.error('获取内容错误:', e);
                                    throw new Error('无法获取编辑内容');
                                }
                                const updateStatus = (message, isError = false) => {
                                    const statusElem = document.getElementById('saveStatus');
                                    if (statusElem) {
                                        statusElem.textContent = message;
                                        statusElem.style.color = isError ? 'red' : '#666';
                                    }
                                };
                                const resetButton = () => {
                                    button.textContent = '保存';
                                    button.disabled = false;
                                };
                                if (newContent !== originalContent) {
                                    updateButtonText('发送保存请求');
                                    fetch(window.location.href, {
                                        method: 'POST',
                                        body: newContent,
                                        headers: {
                                            'Content-Type': 'text/plain;charset=UTF-8'
                                        },
                                        cache: 'no-cache'
                                    })
                                    .then(response => {
                                        updateButtonText('检查响应状态');
                                        if (!response.ok) {
                                            throw new Error(\`HTTP error! status: \${response.status}\`);
                                        }
                                        updateButtonText('更新保存状态');
                                        const now = new Date().toLocaleString();
                                        document.title = \`编辑已保存 \${now}\`;
                                        updateStatus(\`已保存 \${now}\`);
                                    })
                                    .catch(error => {
                                        updateButtonText('处理错误');
                                        console.error('Save error:', error);
                                        updateStatus(\`保存失败: \${error.message}\`, true);
                                    })
                                    .finally(() => {
                                        resetButton();
                                    });
                                } else {
                                    updateButtonText('检查内容变化');
                                    updateStatus('内容未变化');
                                    resetButton();
                                }
                            } catch (error) {
                                console.error('保存过程出错:', error);
                                button.textContent = '保存';
                                button.disabled = false;
                                const statusElem = document.getElementById('saveStatus');
                                if (statusElem) {
                                    statusElem.textContent = \`错误: \${error.message}\`;
                                    statusElem.style.color = 'red';
                                }
                            }
                        }

                        textarea.addEventListener('blur', saveContent);
                        textarea.addEventListener('input', () => {
                            clearTimeout(timer);
                            timer = setTimeout(saveContent, 5000);
                        });
                    }
                    function toggleNotice() {
                        const noticeContent = document.getElementById('noticeContent');
                        const noticeToggle = document.getElementById('noticeToggle');
                        if (noticeContent.style.display === 'none' || noticeContent.style.display === '') {
                            noticeContent.style.display = 'block';
                            noticeToggle.textContent = '隐藏访客订阅∧';
                        } else {
                            noticeContent.style.display = 'none';
                            noticeToggle.textContent = '查看访客订阅∨';
                        }
                    }

                    document.addEventListener('DOMContentLoaded', () => {
                        document.getElementById('noticeContent').style.display = 'none';
                    });
                    </script>
                </body>
            </html>
        `;
        return new Response(html, {
            headers: { "Content-Type": "text/html;charset=utf-8" }
        });
    } catch (error) {
        console.error('处理请求时发生错误:', error);
        return new Response("服务器错误: " + error.message, {
            status: 500,
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
    }
}
