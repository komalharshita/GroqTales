import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Story from '../../../../models/Story';
import Outbox from '../../../../models/Outbox';
import dbConnect from '@/lib/dbConnect';

export async function POST(req: Request) {
  await dbConnect();
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    const { storyId } = await req.json();

    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const story = await Story.findOneAndUpdate(
      { _id: storyId, status: 'draft', authorWallet: session.user.wallet },
      { status: 'publishing' },
      { session, new: true }
    );

    if (!story) {
      throw new Error('Story not found or not in draft state');
    }

    const eventPayload = {
      storyId: story._id,
      authorWallet: story.authorWallet,
      metadataUri: story.ipfsHash,
      title: story.title
    };

    await Outbox.create([{
      eventType: 'MintRequested',
      aggregateId: story._id,
      payload: eventPayload,
      status: 'pending'
    }], { session });

    await session.commitTransaction();
    return NextResponse.json({ success: true, storyId });

  } catch (error: any) {
    await session.abortTransaction();
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  } finally {
    session.endSession();
  }
}