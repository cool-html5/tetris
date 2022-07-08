import {useEffect, useRef, useState} from "react"
import {useEventListener} from "./hooks/use-event-listener"
import {NextPiece} from "./next-piece"
import {Tetromino} from "./tetromino"
import {BlockType} from "./types"

const cellWidth = 30
const cellHeight = 30

type Props = {
	horizontalCells: number
	verticalCells: number
}

export const Game = (props: Props) => {
	const {horizontalCells, verticalCells} = props
	const [gameStats, setGameStats] = useState({score: 0, rows: 0, level: 1})
	const gameStatsRef = useRef(gameStats)
	const [buttonStates, setButtonStates] = useState({start: true, pause: false, newGame: false})
	const [nextType, setNextType] = useState<BlockType>()
	const nextTypeRef = useRef(nextType)
	const intervalHandle = useRef<number>()
	const intervalInMs = useRef(500)
	const cellTable = useRef(new Array(verticalCells).fill(0).map(() => new Array(horizontalCells).fill(0)))
	const context = useRef<CanvasRenderingContext2D>()
	const mino = useRef<Tetromino>()
	const gamePaused = useRef(false)
	const canvasWidth = cellWidth * horizontalCells
	const canvasHeight = cellHeight * verticalCells

	const deactivateTimer = function () {
		clearInterval(intervalHandle.current)
		intervalHandle.current = undefined
	}

	const initCellTable = function () {
		cellTable.current = new Array(verticalCells).fill(0).map(() => new Array(horizontalCells).fill(0))
	}

	const updateScore = function () {
		if (mino?.current !== undefined) {
			const fullRows = mino.current.getFullRows()
			const level = gameStatsRef.current.level
			let newScore = gameStatsRef.current.score

			switch (fullRows) {
				case 1:
					newScore += 50 + level * 10
					break
				case 2:
					newScore += 2 * 75 + level * 20
					break
				case 3:
					newScore += 3 * 100 + level * 30
					break
				case 4:
					newScore += 4 * 150 + level * 40
			}

			setGameStats({
				score: newScore,
				rows: gameStatsRef.current.rows + fullRows,
				level: Math.floor((10 + gameStatsRef.current.rows) / 10)
			})
			gameStatsRef.current = {
				score: newScore,
				rows: gameStatsRef.current.rows + fullRows,
				level: Math.floor((10 + gameStatsRef.current.rows) / 10)
			}

			// When level increases, things speed up
			let newInterval = 500 - 20 * (level - 1)
			if (newInterval < 80) {
				newInterval = 80
			}

			if (intervalInMs.current != newInterval) {
				clearInterval(intervalHandle.current)
				intervalInMs.current = newInterval
				intervalHandle.current = setInterval(nextStep, newInterval)
			}
		}
	}

	const drawGrid = function () {
		if (context?.current) {
			context.current.fillStyle = "#FFFFFF"
			context.current.fillRect(0, 0, canvasWidth, canvasHeight)
			context.current.strokeStyle = "#999999"
			context.current.lineWidth = 0.5

			// Draw vertical lines
			for (let x = cellWidth; x < canvasWidth; x += cellWidth) {
				context.current.beginPath()
				context.current.moveTo(x - 0.5, 0)
				context.current.lineTo(x - 0.5, canvasHeight)
				context.current.stroke()
			}

			// Draw horizontal lines
			for (let y = cellHeight; y < canvasHeight; y += cellHeight) {
				context.current.beginPath()
				context.current.moveTo(0, y - 0.5)
				context.current.lineTo(canvasWidth, y - 0.5)
				context.current.stroke()
			}
		}
	}

	const newTetromino = () => {
		if (context?.current) {
			const type = nextTypeRef.current ?? getRandomPiece()
			const xCoord = horizontalCells / 2 - 1
			const yCoord = type == "I" || type == "J" || type == "O" || type == "Z" ? 0 : 1
			mino.current = new Tetromino(
				xCoord,
				yCoord,
				type,
				context.current,
				cellTable.current,
				horizontalCells,
				verticalCells
			)

			if (mino.current.check(xCoord, yCoord, 0)) {
				stopGame()
				return
			}

			mino.current.draw()
			const next = getRandomPiece()
			setNextType(next)
			nextTypeRef.current = next
		}
	}

	const gameOver = function () {
		if (context?.current) {
			context.current.font = "48px Georgia"
			const gradient = context.current.createLinearGradient(0, 0, canvasWidth, 0)
			gradient.addColorStop(0, "magenta")
			gradient.addColorStop(0.5, "blue")
			gradient.addColorStop(1.0, "red")
			context.current.fillStyle = gradient
			context.current.fillText("GAME OVER!", 10, 300)
		}
	}

	const nextStep = function () {
		if (mino?.current && mino.current.moveDown()) {
			updateScore()
			newTetromino()
		}
	}

	const getRandomPiece = (): BlockType => {
		const blockArray: Array<BlockType> = ["I", "J", "L", "O", "S", "T", "Z"]
		let luku = 0

		// Math.Random seems to underrepresent first and last numbers, so discard those
		while (luku === 0 || luku === 8) {
			luku = Math.round(Math.random() * 8)
		}
		luku--
		return blockArray[luku]
	}

	const startGame = function () {
		setTimeout(newTetromino)
		setButtonStates({start: false, pause: true, newGame: true})
		intervalHandle.current = setInterval(nextStep, intervalInMs.current)
	}

	const togglePause = function () {
		if (gamePaused.current) {
			nextStep()
			intervalHandle.current = setInterval(nextStep, intervalInMs.current)
		} else {
			deactivateTimer()
		}

		setButtonStates({start: false, pause: true, newGame: true})
		gamePaused.current = !gamePaused.current
	}

	const newGame = function () {
		deactivateTimer()
		intervalInMs.current = 500
		mino.current = undefined
		setNextType(undefined)
		nextTypeRef.current = undefined
		drawGrid()
		setGameStats({score: 0, rows: 0, level: 1})
		initCellTable()
		setButtonStates({start: true, pause: false, newGame: false})
	}

	const stopGame = function () {
		setButtonStates({start: false, pause: false, newGame: true})
		deactivateTimer()
		gameOver()
	}

	const keyDownHandler = function (event: KeyboardEvent) {
		if (mino.current) {
			switch (event.code) {
				case "Space":
					event.preventDefault()
					if (intervalHandle.current || gamePaused.current) {
						togglePause()
					}
					break
				case "ArrowUp":
					event.preventDefault()
					if (intervalHandle.current || !gamePaused.current) {
						mino.current.rotateRigth()
					}
					break
				case "ArrowDown":
					event.preventDefault()
					if (intervalHandle.current || !gamePaused.current) {
						nextStep()
					}
					break
				case "ArrowLeft":
					event.preventDefault()
					if (intervalHandle.current || !gamePaused.current) {
						mino.current.moveLeft()
					}
					break
				case "ArrowRight":
					event.preventDefault()
					if (intervalHandle.current || !gamePaused.current) {
						mino.current.moveRigth()
					}
					break
			}
		}
	}

	useEventListener("keydown", keyDownHandler as (event: Event) => void)

	useEffect(() => {
		if (context?.current) {
			drawGrid()
		}
	}, [context.current])

	useEffect(() => {
		const canvas = document.getElementById("canvas-tetris")! as HTMLCanvasElement
		context.current = canvas.getContext("2d")!
	}, [])

	return (
		<div className="ml-24">
			<h1 className="text-3xl font-bold p-6">Tetris</h1>

			<div className="flex flex-row">
				<div className="flex flex-row w-80 ml-6 rounded-xl border-2 border-slate-300 cursor-default">
					<button
						disabled={!buttonStates.start}
						onClick={startGame}
						className="flex-initial w-24 px-5 py-2 border-r-2 rounded-l-lg hover:bg-slate-200 disabled:text-gray-400"
					>
						Start
					</button>
					<button
						disabled={!buttonStates.pause}
						onClick={togglePause}
						className="flex-initial w-24 px-5 py-2 border-r-2 hover:bg-slate-200 disabled:text-gray-400"
					>
						{gamePaused.current ? "Resume" : "Pause"}
					</button>
					<button
						disabled={!buttonStates.newGame}
						onClick={newGame}
						className="flex-initial grow px-5 py-2 rounded-r-lg hover:bg-slate-200 disabled:text-gray-400"
					>
						New game
					</button>
				</div>
				<div className="flex flex-row w-40 ml-6 rounded-xl border-2 border-slate-300 cursor-default">
					<div className="flex-initial px-5 py-2 border-r-2 rounded-l-lg bg-slate-200">Score</div>
					<div className="flex-initial grow pl-3 py-2 rounded-r-xl">{gameStats.score}</div>
				</div>
				<div className="flex flex-row w-36 ml-6 rounded-xl border-2 border-slate-300 cursor-default">
					<div className="flex-initial px-5 py-2 border-r-2 rounded-l-lg bg-slate-200">Rows</div>
					<div className="flex-initial grow px-5 py-2 rounded-r-xl">{gameStats.rows}</div>
				</div>
				<div className="flex flex-row w-36 ml-6 rounded-xl border-2 border-slate-300 cursor-default">
					<div className="flex-initial px-5 py-2 border-r-2 rounded-l-lg bg-slate-200">Level</div>
					<div className="flex-initial grow px-5 py-2 rounded-r-xl">{gameStats.level}</div>
				</div>
			</div>

			<div className="flex flex-row my-5 mx-8">
				<canvas
					id="canvas-tetris"
					width={canvasWidth}
					height={canvasHeight}
					className="border-2 border-slate-300"
				></canvas>
				<div className="flex-initial grow pl-36 py-2 text-xl">
					<div className="ml-4">Next piece:</div>
					<div className="mt-6">
						<NextPiece type={nextType} />
					</div>
				</div>
			</div>
		</div>
	)
}
