/********************************************************************
 * DOWNLOAD ALL IMAGES FROM A BOARD FROM YOUR INVOKEAI API ENDPOINT *
 * USAGE: NODE DOWNLOAD_IMAGES_FROM_BOARD.JS <BOARD_NAME>           *
 ********************************************************************/

import Axios from 'axios'
import FS from 'fs'
import Chalk from 'chalk'
import ProgressBar from 'progress'

import 'dotenv/config'

const args = process.argv.slice(2)

const { INVOKE_AI_BASE } = process.env

const [boardName] = args

console.log(Chalk.gray('Getting boards...'))
const boards = (await Axios.get(`http://${INVOKE_AI_BASE}/api/v1/boards/?all=true`)).data

let board = undefined
for (var b of boards) {
	if (b.board_name === boardName) board = b
}

if (board == undefined) {
	Chalk.red(`Could not find board with name '${boardName}'!`)
	process.exit(-1)
}

const { board_id, board_name, image_count } = board
console.log(Chalk.green('Found Board!'), Chalk.gray(`${board_id} (${board_name}), Image Count: ${image_count}`))

console.log(Chalk.gray(`Getting image names from '${board_id}'...`))
const images = (await Axios.get(`http://${INVOKE_AI_BASE}/api/v1/boards/${board_id}/image_names`)).data

console.log(Chalk.gray(`Got ${images.length} images! Downloading...`))
if (!FS.existsSync(`boards/${board_id}`)) FS.mkdirSync(`boards/${board_id}`, { recursive: true })

var bar = new ProgressBar('  Downloading [:bar] :rate/bps :percent :etas', {
	complete: '=',
	incomplete: ' ',
	width: 50,
	total: image_count,
})

let i = 0
for (var img of images) {
	FS.writeFileSync(
		`boards/${board_id}/${i++}.png`,
		(await Axios.get(`http://${INVOKE_AI_BASE}/api/v1/images/i/${img}/full`, { responseType: 'arraybuffer' })).data
	)
	bar.tick()
}

console.log(Chalk.green('Done!'))
