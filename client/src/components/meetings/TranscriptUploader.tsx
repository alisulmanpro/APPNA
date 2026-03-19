"use client";

import { useState } from "react";
import { Save, FileText } from "lucide-react";

interface TranscriptUploaderProps {
    meetingId: string;
    transcript: string | null;
    onSave: (transcript: string) => void;
    isSaving?: boolean;
}

export default function TranscriptUploader({
    meetingId: _meetingId,
    transcript,
    onSave,
    isSaving = false,
}: TranscriptUploaderProps) {
    const [isEditing, setIsEditing] = useState(!transcript);
    const [text, setText] = useState(transcript || "");

    const handleSave = () => {
        onSave(text);
        setIsEditing(false);
    };

    return (
        <div>
            {!isEditing && transcript ? (
                <div className="relative">
                    <pre className="text-sm text-base-content/80 whitespace-pre-wrap bg-base-200 rounded-xl p-4 border border-base-300 max-h-64 overflow-y-auto font-sans leading-relaxed">
                        {transcript}
                    </pre>
                    <button
                        className="btn btn-ghost btn-xs mt-3"
                        onClick={() => setIsEditing(true)}
                    >
                        Edit Transcript
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Textarea */}
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste or type the meeting transcript here..."
                        className="textarea textarea-bordered w-full h-40 text-sm font-mono resize-none focus:outline-none focus:border-primary"
                    />

                    {/* Hint */}
                    <p className="text-xs text-base-content/40 flex items-center gap-1">
                        <FileText size={11} />
                        Paste raw transcript text from recording software or type manually.
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            className="btn btn-primary btn-sm gap-2"
                            onClick={handleSave}
                            disabled={!text.trim() || isSaving}
                        >
                            {isSaving ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <Save size={14} />
                            )}
                            Save Transcript
                        </button>
                        {transcript && (
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => { setText(transcript); setIsEditing(false); }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
