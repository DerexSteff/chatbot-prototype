export interface ChatEntry {
    contents: Content[],
    isChatbot: boolean
}

export interface Content {
    content: string,
    type: string
}