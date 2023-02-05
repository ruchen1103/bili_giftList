const { chromium } = require('playwright');

async function openPageToGetBilibiliCookie() {
	const browser = await chromium.launch({ headless: false });
	const context = await browser.newContext();
	const page = await context.newPage();

	await page.goto('https://www.bilibili.com');

	const promise = new Promise(async (resolve) => {
		page.on('close', async () => {
			cookies = await context.cookies(page.url());
			cookies.map((item) => {
				item.domain = 'localhost:3000';
			});
			await context.addCookies(cookies);
			await page.goto('http://localhost:3000/bili_giftList');
		});

		//监听登录成功请求
		page.on('response', async (response) => {
			if (
				response.url().indexOf('https://passport.bilibili.com/x/passport-login/web/login') >
					-1 &&
				response.status() == 200
			) {
				let res = JSON.parse((await response.body()).toString());
				if (res.data.message == '') {
					cookies = await context.cookies(page.url());
					cookies.map((item) => {
						item.domain = 'localhost:3000';
					});
					await context.addCookies(cookies);
					await page.goto('http://localhost:3000/bili_giftList');
				}
			}
			if (
				response
					.url()
					.indexOf('https://passport.bilibili.com/x/passport-login/web/qrcode/poll') >
					-1 &&
				response.status() == 200
			) {
				let res = JSON.parse((await response.body()).toString());
				if (res.data.message == '') {
					cookies = await context.cookies(page.url());
					cookies.map((item) => {
						item.domain = 'localhost:3000';
					});
					await context.addCookies(cookies);
					await page.goto('http://localhost:3000/bili_giftList');
				}
			}
		});
	});
	return promise;
}
async function main() {
	const cookies = await openPageToGetBilibiliCookie();
}

main();
