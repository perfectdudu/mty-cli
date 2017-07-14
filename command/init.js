'use strict'
const exec = require('child_process').exec
require('shelljs/global');
const co = require('co')
const prompt = require('co-prompt')
const config = require('../templates')
const chalk = require('chalk')
var fs = require('fs');

module.exports = () => {
	co(function *() {
		// 处理用户输入
		let tplName = yield prompt('样板名称: ')
		if (!config.tpl[tplName]) {
			console.log(chalk.red('\n × 项目样板不存在!'))
			process.exit()
		}
		let projectName = yield prompt('自定义项目名称:')
		if(!projectName){
			console.log(chalk.red('\n × 请填写项目名称!'))
			process.exit()
		}
		let version = yield prompt('项目版本号(1.0.0) ')
		let description = yield prompt('项目描述(A project) ')
		let keywords = yield prompt('项目关键字(nodejs,express,mty) ')
		let author = yield prompt('作者(makan <makan@feinno.com>)')
		let gitUrl
		let branch
		gitUrl = config.tpl[tplName].url
		branch = config.tpl[tplName].branch
		console.log(chalk.white('\n 正在构建项目...'))
		// git命令，远程拉取项目并自定义项目名
		let cmdStr = `git clone ${gitUrl} ${projectName} && git checkout ${branch}`
		var promise = new Promise((resolve, reject) => {
			exec(cmdStr, (error, stdout, stderr) => {
				if (error) {
					reject(new Error(error));
				}
				resolve();

			})
			return promise;
		})
		promise.then(_ => {
			cd(projectName)
			console.log(chalk.green('\n √ 项目构建完成'))
			console.log(`\n cd ${projectName} && npm install \n`)
			fs.readFile('./package.json', 'utf-8', (err, data) => {
				if (err) {
					console.log(err);
					process.exit()
				} else {
					console.log("读取package相关数据");
					var data = JSON.parse(data)
					data.name = projectName
					data.version = version || '1.0.0'
					data.description = version || 'A project'
					data.keywords = version || 'nodejs,express,mty'
					data.author = version || "makan <makan@feinno.com>"
					var t = JSON.stringify(data, null, 4);
					fs.writeFileSync('./package.json', t)
					process.exit()
				}
			})
		}, (error) => {
			console.log(error)
			process.exit()
		})

	})

}
