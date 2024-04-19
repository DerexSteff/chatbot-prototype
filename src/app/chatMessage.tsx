import { ChatEntry, Content } from "@/types";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export default function ChatMessage({ chatEntry }: { chatEntry: ChatEntry }) {
  const getComponent = (content: Content) => {
    switch (content.type) {
      case "image":
        return <img src={content.content} alt="Response Image"></img>
      case "video":
        return <iframe width={560} height={310} src={ `https://www.youtube.com/embed/${extractYouTubeVideoId(content.content)}` } allowFullScreen></iframe>
      default:
        return <p>{ content.content }</p>
    }
  }

  function extractYouTubeVideoId(url: string) {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  if (chatEntry.isChatbot) {
    return (
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="Chatbot Avatar" />
          <AvatarFallback>CB</AvatarFallback>
        </Avatar>
        <div>
          { chatEntry.contents.map(content => getComponent(content)) }
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-4">
      <p>{ chatEntry.contents[0].content}</p>
      <Avatar>
        <AvatarImage src="https://avatars.githubusercontent.com/u/74837144?v=4" alt="User Avatar" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    </div>
  );
}