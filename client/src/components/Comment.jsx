import { IconButton } from "./IconButton"
import { FaEdit, FaHeart, FaReply, FaTrash } from "react-icons/fa"
import { usePost } from "../contexts/PostContext"
import { CommentList } from "./CommentList"
import { useState } from "react"

const dateFormatter = new Intl.DateTimeFormat(undefined, {
	dateStyle: 'short',
	timeStyle: 'short',
})

export function Comment({
	id,
	message,
	user,
	created_at }) {

	const { getReplies } = usePost()
	const childComments = getReplies(id)
	const [areChildrenHidden, setAreChildrenHidden] = useState(false)

	return <>
		<div className="comment">
			<div className="header">
				<span className="name">{user.name}</span>
				<span className="date">{dateFormatter.format(Date.parse(created_at))}</span>
			</div>
			<div className="message">{message}</div>
			<div className="footer">
				<IconButton Icon={FaHeart} aria-label="Like">
					2
				</IconButton>
				<IconButton Icon={FaReply} aria-label="Reply" />
				<IconButton Icon={FaEdit} aria-label="Edit" />
				<IconButton Icon={FaTrash} aria-label="Delete" color="danger" />
			</div>
		</div>
		{childComments?.length > 0 && (
			<>
				<div className={`nested-comments-stack ${areChildrenHidden ? "hide" : ""}`}>
					<button className="collapse-line" aria-label="Hide Replies" onClick={() => setAreChildrenHidden(true)} />
					<div className="nested-comments">
						<CommentList comments={childComments} />
					</div>
				</div>
				<button
					className={`btn mt-1 ${!areChildrenHidden ? "hide" : ""}`}
					onClick={() => setAreChildrenHidden(false)}
				>
					Show Replies
				</button>
			</>
		)}
	</>

}