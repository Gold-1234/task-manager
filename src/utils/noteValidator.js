export const authorizeNote = (notes = [], userId) => {
	const filteredNotes = notes.filter(note =>
      !note.isPrivate || note.createdBy.toString() === userId
    );

	return filteredNotes;
}