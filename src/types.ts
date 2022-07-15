export type GameStats = {
	score: number
	rows: number
	level: number
}

export type ButtonStates = {
	start: boolean
	pause: boolean
	newGame: boolean
}

export type BlockType = "I" | "O" | "T" | "S" | "Z" | "J" | "L"

export type Block = {
	type: BlockType
	color: string
	form: number[][][]
}
