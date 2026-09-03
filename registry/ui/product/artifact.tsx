import { useState, type KeyboardEvent } from 'react'
import { SourceLine } from './information'
import type { SemanticRecord } from './semantic'

export type ArtifactStatus = 'ready' | 'loading' | 'missing' | 'error'

export function ArtifactViewer({
  src,
  alt,
  caption,
  fit = 'contain',
  status = 'ready',
}: {
  src?: string
  alt: string
  caption?: string
  fit?: 'contain' | 'cover'
  status?: ArtifactStatus
}) {
  const effectiveStatus = status === 'ready' && !src ? 'missing' : status
  return (
    <figure className="k-artifact-viewer" data-fit={fit}>
      <div className="k-artifact-stage">
        {effectiveStatus === 'loading' ? <span role="status">Loading artifact…</span> : null}
        {effectiveStatus === 'missing' ? <span>Artifact is missing.</span> : null}
        {effectiveStatus === 'error' ? <span role="alert">Artifact could not be loaded.</span> : null}
        {effectiveStatus === 'ready' && src ? <img src={src} alt={alt} /> : null}
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  )
}

export type ArtifactItem = {
  id: string
  src: string
  alt: string
  caption?: string
}

export function ArtifactGallery({ items }: { items: readonly ArtifactItem[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const boundedIndex = items.length === 0 ? 0 : Math.min(selectedIndex, items.length - 1)
  const selected = items[boundedIndex]

  function move(delta: number) {
    if (items.length < 2) return
    setSelectedIndex((current) => (current + delta + items.length) % items.length)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      move(-1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      move(1)
    }
  }

  if (items.length === 0) return <ArtifactViewer alt="Missing artifact" status="missing" />

  return (
    <div className="k-artifact-gallery" tabIndex={0} onKeyDown={onKeyDown} aria-label="Artifact gallery. Use left and right arrow keys to change selection.">
      <ArtifactViewer src={selected.src} alt={selected.alt} caption={selected.caption} />
      {items.length > 1 ? (
        <div className="k-artifact-thumbnails" aria-label="Artifacts">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className="k-artifact-thumbnail"
              aria-pressed={index === boundedIndex}
              aria-label={`Show artifact ${index + 1}: ${item.alt}`}
              onClick={() => setSelectedIndex(index)}
            >
              <img src={item.src} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function ArtifactMetadata({
  filename,
  version,
  generatedAt,
  source,
  limitation,
}: {
  filename: string
  version: string
  generatedAt: string
  source?: SemanticRecord | null
  limitation?: string
}) {
  return (
    <dl className="k-artifact-metadata">
      <div><dt>Filename</dt><dd>{filename}</dd></div>
      <div><dt>Version</dt><dd>{version}</dd></div>
      <div><dt>Generated</dt><dd><time dateTime={generatedAt}>{generatedAt}</time></dd></div>
      <div className="k-artifact-source"><dt>Source</dt><dd><SourceLine source={source} /></dd></div>
      {limitation ? <div><dt>Limitation</dt><dd>{limitation}</dd></div> : null}
    </dl>
  )
}
