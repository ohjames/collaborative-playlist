import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/shareReplay'
import 'rxjs/add/operator/throttleTime'

type ScrollObservable = Observable<any>
const scrollEventObservables: WeakMap<Element | Window, ScrollObservable> = new WeakMap()

export default function(
  element: Element,
  parentElement: Element = null,
  scrollTarget: Element | Window = null,
  buffer: number = 0,
): ScrollObservable {
  if (! parentElement) {
    const { parentNode } = element
    if (! parentNode) {
      throw new Error('element has no parent')
    }
    parentElement = parentNode as Element
  }

  if (! scrollTarget)
    scrollTarget = parentElement

  let parentScrolls = scrollEventObservables.get(scrollTarget)
  if (! parentScrolls) {
    parentScrolls = new Observable<any>(observer => {
      let latestEvent = null

      scrollTarget.addEventListener('scroll', event => {
        if (! latestEvent) {
          requestAnimationFrame(() => {
            observer.next(latestEvent)
            latestEvent = null
          })
        }
        latestEvent = event
      })
    }).shareReplay(1)
    scrollEventObservables.set(parentElement, parentScrolls)
  }

  return parentScrolls.map((scrollEvent: any) => {
    // TODO: calculate from parentElement
    const scrollTop = 0
    const scrollBottom = scrollTop + parentElement.clientHeight
    const { top, bottom } = element.getBoundingClientRect()
    return top < (scrollBottom + buffer) && bottom > (scrollTop - buffer)
  })
}
