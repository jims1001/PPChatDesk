
import Tabs from '@/components/tabs'
import EmptyState from '@/components/emptyState'

export default function InboxMy() {
    return (
        <>
            <Tabs />
            <div className="mt-8">
                <EmptyState text="您的收件箱中似乎没有客户的消息。" />
            </div>
        </>
    )
}
