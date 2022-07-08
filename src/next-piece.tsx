import {useEffect, useRef} from "react"
import {Blocks} from "./blocks"
import {BlockType} from "./types"

type Props = {
	type: BlockType | undefined
}

export const NextPiece = (props: Props) => {
	const cellWidth = 30
	const cellHeight = 30
	const context = useRef<CanvasRenderingContext2D>()

	const draw = () => {
		if (context?.current) {
			context.current.fillStyle = "floralwhite"
			context.current.fillRect(0, 0, 200, 150)

			if (props.type) {
				const block = Blocks.find((b) => b.type === props.type)!
				context.current.fillStyle = block.color
				context.current.lineWidth = 0.5

				for (let i = 0; i < 4; i++) {
					const x = (1 + block.form[0][i][0]) * cellWidth + 0.5
					const y = (1 + block.form[0][i][1]) * cellHeight + 0.5
					const w = cellWidth - 1.5
					const h = cellHeight - 1.5

					context.current.fillRect(x, y, w, h)
				}
			}
		}
	}

	useEffect(() => {
		const canvasNextPiece = document.getElementById("canvas-next-piece")! as HTMLCanvasElement
		context.current = canvasNextPiece.getContext("2d")!
	}, [])

	useEffect(() => {
		draw()
	}, [props.type])

	return <canvas id="canvas-next-piece" width="200" height="150"></canvas>
}
