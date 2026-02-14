import ChatView from "@/app/components/chat/ChatView";

export default async function Page({ params }: { params: any }) {
    const resolvedParams = await params;

    return (
        /* Vi bruger bg-[#0a1f1a] for at matche British Racing Green fra din TopBar */
        <div className="min-h-screen bg-[#0a1f1a] pt-20 px-4 md:px-10 pb-10">
            <div className="max-w-5xl mx-auto h-[80vh] bg-[#0a1f1a] rounded-[2.5rem] shadow-2xl border border-white/5 overflow-hidden">
                <ChatView threadId={resolvedParams.threadId} isModal={false} />
            </div>
        </div>
    );
}