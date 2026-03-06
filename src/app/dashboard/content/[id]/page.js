"use client";
import EnhancedContentManager from '@/components/EnhancedContentManager';
import { useParams } from 'next/navigation';

export default function ContentManagerPage() {
  const params = useParams();
  const { id } = params;

  return <EnhancedContentManager shopId={id} />;
}
