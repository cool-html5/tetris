export type BlockType = "I" | "O" | "T" | "S" | "Z" | "J" | "L"

export type Block = {
	type: BlockType
	color: string
	form: number[][][]
}
