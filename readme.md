自定义前端脚手架
--------

# 更新日志

## v1.0.5(2017/7/14)
*   增加自定义package相关信息

## v1.0.5(2017/7/13)
*   增加node——vue项目模板

## v1.0.5(2017/7/12)
*   增加node项目模板






# 前言

现阶段新启动一个项目，基本还出于Copy的模式，没有一个统一管理的基础项目，本文主要讲的是构建一个自己的脚手架
目前比较常用的是yeoman,express-generator,vue-cli。它们都很成熟了，此文只是简单地构建一个自己的私有脚手架

# 核心原理

```yeoman```搭建项目需要提供```yeoman-generator```。```yeoman-generator```本质上就是一个具备完整文件结构的项目样板，用户需要手动地把这些```generator```下载到本地，然后```yeoman```就会根据这些```generator```自动生成不同的项目。

```vue-cli```提供了相当丰富的选项和设定功能，但是本质也是从远程仓库把不同的模板拉取到本地。而并非是什么"本地生成的"黑科技

脚手架根据用户的指令引用样板项目生成实际项目，样板项目可以内置在脚手架当中，也可以部署在远程仓库，我们采用第二种方式


## 技术选项

* ```nodeJs``` ：整个脚手架工具的根本组成部分，推荐使用最新的版本。

* ```es6``` ：新版本的node.js对于es6的支持度已经非常高，使用es6能够极大地提升开发效率和开发感受。

* ```commander``` ：TJ大神开发的工具，能够更好地组织和处理命令行的输入。

* ```co``` ： TJ大神开发的异步流程控制工具，用更舒服的方式写异步代码

* ```co-prompt```：TJ大神开发作品，传统的命令行只能单行一次性地输入所有参数和选项，使用这个工具可以自动提供提示信息，并且分步接收用户的输入，体验类似npm init时的一步一步输入参数的过程



## 整体架构

开发之前先看图
![示意图](https://sfault-image.b0.upaiyun.com/386/987/3869878572-57a5535c106ab_articlex)

首先要理解一个模板就是一个项目的样板，包含项目的完整结构和信息
模板的信息都存放在一个叫做templates.json的文件中
用户可以通过命令行对tempaltes.json进行添加，删除，罗列的操作
通过选在不同的模板，它会自动从远程仓库把相应的模板来取到本地。完成项目的搭建

最终整个脚手架的文件结构如下：

```
|__ bin
    |__ mty-cli
|__ command
    |__ add.js
    |__ delete.js
    |__ init.js
    |__ list.js
|__ node_modules
|__ package.json
|__ templates.json

```



## 入口文件

首先建立项目，在package.json里面写入依赖并执行npm install：

```
"dependencies": {
    "chalk": "^1.1.3",
    "co": "^4.6.0",
    "co-prompt": "^1.0.0",
    "commander": "^2.9.0"
}
```

在根目录下建立```\bin```文件夹，在里面建立一个无后缀名的``mty-cli``文件。这个```bin\mty-cli```文件是整个脚手架的入口文件，所以我们首先对它进行编写。


首先是一些初始化的代码：

```
#!/usr/bin/env node --harmony
'use strict'
 // 定义脚手架的文件路径
process.env.NODE_PATH = __dirname + '/../node_modules/'

const program = require('commander')

 // 定义当前版本
program
    .version(require('../package').version )

// 定义使用方法
program
    .usage('<command>')
```


从前文的架构图中可以知道，脚手架支持用户输入4种不同的命令。现在我们来写处理这4种命令的方法：

```

program
    .command('list')
    .description('List all the templates')
    .alias('l')
    .action(() => {
        require('../command/list')()
    })

program
    .command('init')
    .description('Generate a new project')
  .alias('i')
  .action(() => {
    require('../command/init')()
  })

```

commander的具体使用方法， [请猛戳这里](https://github.com/tj/commander.js/)

别忘了处理参数和提供帮助信息

```
program.parse(process.argv)

if(!program.args.length){
  program.help()
}
```


使用```node```这个文件，看到输出如下，证明入口文件已经编写完成了。


结果如下

```
Usage: mty-cli <command>


  Commands:

    add|a      Add a new template
    list|l     List all the templates
    init|i     Generate a new project
    delete|d   Delete a template

  Options:

    -h, --help     output usage information
    -V, --version  output the version number

```


# 处理用户输入

在项目根目录下建立```\command```文件夹，专门用来存放命令处理文件。
在根目录下建立```templates.json```文件并写入如下内容，用来存放模版信息：

```
{"tpl":{}}
```

# 罗列模板

建立```list.js```文件

```
'use strict'
const config = require('../templates')

module.exports = () => {
     console.log(config.tpl)
     process.exit()
}
```

# 构建项目

现在来到我们最重要的部分——构建项目。同样的，在```\command```目录下新建一个叫做```init.js```的文件：

```
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

```

可以看到，这一部分代码也非常简单，关键的一句话是

```
let cmdStr = `git clone ${gitUrl} ${projectName} && cd ${projectName} && git checkout ${branch}`
```

它的作用正是从远程仓库克隆到自定义目录，并切换到对应的分支。熟悉git命令的同学应该明白，不熟悉的同学是时候补补课啦！

# 全局使用

为了可以全局使用，我们需要在```package.json```里面设置一下：

```
"bin": {
    "mty-cli": "bin/mty-cli"
  },
```

本地调试的时候，在根目录下执行

```
npm link
```


即可把```mty-cli```命令绑定到全局，以后就可以直接以```mty-cli```作为命令开头而无需敲入长长的```node mty-cli```之类的命令了。

现在我们的脚手架工具已经搭建好了，一起来尝试一下吧！


# 使用方法



* init | i 生成项目命令

``` mty-cli init ```


* list | l 罗列模版命令

 ``` mty-cli list ```


大功告成啦！现在我们的整个脚手架工具已经搭建完成了，以后只需要知道模板的git https地址和branch就可以不断地往```mty-cli```上面添加，团队协作的话只需要分享```mty-cli```的templates.json文件就可以了。
