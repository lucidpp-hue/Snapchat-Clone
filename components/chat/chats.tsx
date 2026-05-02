import { createClient } from '@/lib/supabase/server'
import { getUsersForSidebar } from '@/lib/data';
import React from 'react';
import Chat from './chat';

const Chats = async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const chats = user ? await getUsersForSidebar(user.id) : [];

    return (
        <nav className='flex-1 overflow-y-auto'>
            <ul>
                {chats.map(chat => (
                    <Chat key={chat._id} chat={chat} />
                ))}
            </ul>
        </nav>
    )
}

export default Chats
