import { useEffect, useRef } from 'react'
import { ArrowUp, Mic, MicOff, Square } from 'lucide-react'
import { useSpeechInput } from '@/lib/speech'
import { toast } from '@/lib/toast'
import { useSettings } from '@/lib/store'

export const MAX_PROMPT_CHARS = 8000

export function Composer({
  value,
  onChange,
  onSubmit,
  onStop,
  busy = false,
  placeholder = 'Message AIVORA AI…',
  autoFocus = false,
  large = false,
  label = 'Message',
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: (text: string) => void
  onStop?: () => void
  busy?: boolean
  placeholder?: string
  autoFocus?: boolean
  large?: boolean
  label?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const settings = useSettings()
  const voice = useSpeechInput({
    lang: settings.speechLang,
    onText: (text) => onChange(value ? `${value.trimEnd()} ${text}` : text),
    onError: (m) => toast(m, 'error'),
  })

  // Auto-resize textarea height smoothly
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    const targetHeight = el.scrollHeight
    const maxHeight = large ? 260 : 200
    const minHeight = large ? 72 : 44
    el.style.height = `${Math.min(Math.max(targetHeight, minHeight), maxHeight)}px`
  }, [value, large])

  useEffect(() => {
    if (autoFocus && typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches)
      ref.current?.focus()
  }, [autoFocus])

  const tooLong = value.length > MAX_PROMPT_CHARS
  const canSend = value.trim().length > 0 && !busy && !tooLong

  const submit = () => {
    if (!canSend) return
    onSubmit(value.trim())
  }

  const handleVoiceToggle = () => {
    if (!voice.supported) {
      toast('Voice input is supported in Chrome, Edge, and Safari.', 'info')
      return
    }
    if (voice.listening) {
      voice.stop()
    } else {
      voice.start()
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className={`aivora-composer group relative w-full rounded-[1.5rem] bg-surface/95 backdrop-blur-md transition-all ${
        tooLong ? 'has-error' : ''
      }`}
    >
      <label className="sr-only" htmlFor="composer-input">
        {label}
      </label>
      <textarea
        id="composer-input"
        ref={ref}
        rows={large ? 2 : 1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (
            e.key === 'Enter' &&
            !e.shiftKey &&
            !e.nativeEvent.isComposing &&
            settings.enterToSend
          ) {
            e.preventDefault()
            submit()
          }
        }}
        placeholder={voice.listening ? 'Listening… speak now' : placeholder}
        className={`aivora-composer-textarea block w-full resize-none border-0 bg-transparent text-ink placeholder:text-muted/80 focus:border-0 focus:outline-none focus:ring-0 ${
          large
            ? 'min-h-[72px] px-4 pt-4 pb-2 text-[1rem] sm:min-h-[84px] sm:px-5 sm:pt-4.5 sm:text-[1.05rem]'
            : 'min-h-[44px] px-3.5 pt-3 pb-1.5 text-[0.95rem] sm:px-4.5 sm:pt-3.5'
        }`}
        aria-invalid={tooLong}
        aria-describedby={tooLong ? 'composer-error' : undefined}
      />

      {/* Bottom control row: mic on left, status in middle, send/stop on right */}
      <div className="flex items-center justify-between gap-2 px-3 pb-3 sm:px-4 sm:pb-3.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={handleVoiceToggle}
            className={`icon-btn !h-9 !w-9 sm:!h-10 sm:!w-10 rounded-full shrink-0 transition ${
              voice.listening
                ? '!bg-danger/20 !text-danger ring-2 ring-danger/40 animate-pulse'
                : 'text-muted hover:bg-surface-2 hover:text-ink'
            }`}
            aria-label={voice.listening ? 'Stop voice input' : 'Start voice input'}
            title={voice.listening ? 'Stop voice input' : 'Voice input'}
            disabled={busy}
          >
            {voice.listening ? (
              <MicOff className="h-[18px] w-[18px]" />
            ) : (
              <Mic className="h-[18px] w-[18px]" />
            )}
          </button>

          <span
            id="composer-error"
            className={`truncate text-xs select-none ${
              tooLong ? 'text-danger font-medium' : 'text-faint'
            }`}
            aria-live="polite"
          >
            {tooLong
              ? `Too long: ${value.length.toLocaleString()} / ${MAX_PROMPT_CHARS.toLocaleString()}`
              : value.length > MAX_PROMPT_CHARS * 0.8
                ? `${value.length.toLocaleString()} / ${MAX_PROMPT_CHARS.toLocaleString()}`
                : settings.enterToSend
                  ? <span className="hidden sm:inline">Enter to send · Shift+Enter for new line</span>
                  : null}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {busy && onStop ? (
            <button
              type="button"
              onClick={onStop}
              className="inline-flex h-9 sm:h-10 items-center gap-2 rounded-full border border-line-strong bg-surface-2 px-4 text-xs sm:text-sm font-medium hover:bg-surface transition active:scale-95"
              aria-label="Stop generating"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!canSend}
              className="bg-brand inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-white shadow-lg transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Send message"
            >
              <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
