import {Blocks} from "./blocks"
import {Block, BlockType} from "./types"

const xAdj = 1
const yAdj = 1
const cwAdj = -2.5
const chAdj = -2.5

export class Tetromino {
	x: number
	y: number
	block: Block
	cellTable: number[][]
	context: CanvasRenderingContext2D
	horizontalCells: number
	verticalCells: number
	cellWidth: number
	cellHeight: number

	constructor(
		x: number,
		y: number,
		type: BlockType,
		context: CanvasRenderingContext2D,
		cellTable: number[][],
		horizontalCells: number,
		verticalCells: number
	) {
		this.x = x
		this.y = y
		this.block = Blocks.find((b) => b.type === type)!
		this.context = context
		this.cellTable = cellTable
		this.horizontalCells = horizontalCells
		this.verticalCells = verticalCells
		this.cellWidth = context.canvas.width / horizontalCells
		this.cellHeight = context.canvas.height / verticalCells
	}

	orientation = 0
	fullRows = 0
	colors = ["#ffffff", "#00f0f0", "#0000f0", "#f0a000", "#f0f000", "#00f000", "#a000f0", "#f00000"]

	draw() {
		this.context.fillStyle = this.block.color
		for (let i = 0; i < 4; i++) {
			const x = (this.x + this.block.form[this.orientation][i][0]) * this.cellWidth + xAdj
			const y = (this.y + this.block.form[this.orientation][i][1]) * this.cellHeight + yAdj
			const w = this.cellWidth + cwAdj
			const h = this.cellHeight + chAdj

			this.context.fillRect(x, y, w, h)
		}
	}

	erase() {
		this.context.fillStyle = "#FFFFFF"
		for (let i = 0; i < 4; i++) {
			this.context.fillRect(
				(this.x + this.block.form[this.orientation][i][0]) * this.cellWidth + xAdj,
				(this.y + this.block.form[this.orientation][i][1]) * this.cellHeight + yAdj,
				this.cellWidth - 2,
				this.cellHeight - 2
			)
		}
	}

	// Checks if tetromino goes outside of board with the given coordinates and orientation
	check(x: number, y: number, orientation: number): boolean {
		for (let i = 0; i < 4; i++) {
			const cellX = x + this.block.form[orientation][i][0]
			const cellY = y + this.block.form[orientation][i][1]
			if (cellX > this.horizontalCells - 1 || cellX < 0) {
				return true
			}
			if (cellY > this.verticalCells - 1 || cellY < 0) {
				return true
			}
			if (this.cellTable[cellY][cellX] != 0) {
				return true
			}
		}
		return false
	}

	updateCellTable() {
		for (let i = 0; i < 4; i++) {
			this.cellTable[this.y + this.block.form[this.orientation][i][1]][
				this.x + this.block.form[this.orientation][i][0]
			] = Blocks.indexOf(this.block) + 1
		}
		this.checkRows()
	}

	checkRows() {
		for (let i = 0; i < this.verticalCells; i++) {
			let fullRow = true
			for (let j = 0; j < this.horizontalCells; j++) {
				if (this.cellTable[i][j] == 0) {
					fullRow = false
				}
			}
			if (fullRow) {
				this.context.fillStyle = "#FFFFFF"
				this.context.lineWidth = 0.5
				for (let k = 0; k < this.horizontalCells; k++) {
					this.context.fillRect(
						k * this.cellWidth + xAdj,
						i * this.cellHeight + yAdj,
						this.cellWidth + cwAdj,
						this.cellHeight + chAdj
					)
					this.cellTable[i][k] = 0
				}
				this.shiftRowsAbove(i)
			}
		}
	}

	updateTable() {
		for (let i = 0; i < this.verticalCells; i++) {
			for (let j = 0; j < this.horizontalCells; j++) {
				this.context.fillStyle = this.colors[this.cellTable[i][j]]
				this.context.fillRect(
					j * this.cellWidth + xAdj,
					i * this.cellHeight + yAdj,
					this.cellWidth + cwAdj,
					this.cellHeight + chAdj
				)
			}
		}
	}

	shiftRowsAbove(row: number) {
		for (let i = row; i > 0; i--) {
			for (let j = 0; j < this.horizontalCells; j++) {
				this.cellTable[i][j] = this.cellTable[i - 1][j]
			}
		}
		this.fullRows++
		this.updateTable()
		this.checkRows()
	}

	getFullRows(): number {
		const fr = this.fullRows
		this.fullRows = 0
		return fr
	}

	moveRigth() {
		if (!this.check(this.x + 1, this.y, this.orientation)) {
			this.erase()
			this.x++
			this.draw()
		}
	}

	moveLeft() {
		if (!this.check(this.x - 1, this.y, this.orientation)) {
			this.erase()
			this.x--
			this.draw()
		}
	}

	moveDown() {
		if (!this.check(this.x, this.y + 1, this.orientation)) {
			this.erase()
			this.y++
			this.draw()
			return false
		} else {
			this.updateCellTable()
			return true
		}
	}

	rotateRigth() {
		let newOrientation = this.orientation
		if (newOrientation >= 3) {
			newOrientation = 0
		} else {
			newOrientation++
		}
		if (!this.check(this.x, this.y, newOrientation)) {
			this.erase()
			this.orientation = newOrientation
			this.draw()
		}
	}
}
