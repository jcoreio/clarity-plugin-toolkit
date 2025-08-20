import { MetadataItem } from './TagState'
import {
  useDrop as baseUseDrop,
  DropTargetHookSpec,
  FactoryOrInstance,
  ConnectDropTarget,
  DropTargetMonitor,
} from 'react-dnd'
import { DND_ITEM } from './featureTestDnd'

/**
 * An item that may dragged in Clarity to a drop target registered by {@link useDrop}.
 */
export type ClarityDragObject = {
  /**
   * The current Clarity tag being dragged, if any
   */
  tag?: string
  /**
   * The metadata of the `tag` being dragged, if any
   */
  MetadataItem?: MetadataItem
}

/**
 * The result of a `drop` operation on a drop target registered by {@link useDrop}.
 */
export type ClarityDropResult = {
  dropAction?: 'move' | 'copy'
}

/**
 * The specification for drag-and-drop interaction with Clarity via {@link useDrop}.
 */
export type ClarityDropTargetHookSpec = {
  /**
   * Clarity calls this callback to determine if a given item can be dropped on the connected
   * drop target.  If omitted, Clarity assumes any item can be dropped.
   *
   * @param {ClarityDragObject} item - the {@link ClarityDragObject} being dragged
   * @returns true if Clarity should allow `item` to be dropped on the connected drop target,
   * false otherwise
   */
  canDrop?: (item: ClarityDragObject) => boolean
  /**
   * Optional. Called when a compatible item is dropped on the target. You may either return undefined,
   * or a {@link ClarityDropResult} indicating what action was taken.
   * This method will not be called if `canDrop()` is defined and returns `false`.
   *
   * @param {ClarityDragObject} item - the {@link ClarityDragObject} being dropped
   * @returns {ClarityDropResult} a {@link ClarityDropResult} indicating what action was
   * performed
   */
  drop?: (item: ClarityDragObject) => ClarityDropResult | undefined
}

/**
 * The drag state returned by {@link useDrop}
 */
export type ClarityCollectedProps = {
  /**
   * The current Clarity tag being dragged, if any
   */
  tag?: string
  /**
   * The metadata of the `tag` being dragged, if any
   */
  MetadataItem?: MetadataItem
  /**
   * Whether a drag operation is in progress and the {@link ClarityDropTargetHookSpec.canDrop}
   * returned true
   */
  canDrop: boolean
  /**
   * Whether an in progress drag is hovering over the connected drop target
   */
  isOver: boolean
}

/**
 * React hook for receiving drag-and-dropped tags from Clarity.
 *
 * @param {ClarityDropTargetHookSpec} spec - The drop target specification (object or function, function preferred)
 * @params {unknown[]} deps - The memoization deps array to use when evaluating spec changes
 *
 * @returns {[ClarityCollectedProps, ConnectDropTarget]} a tuple whose first element is the {@link ClarityCollectedProps} drag state,
 * and whose second element is the {@link ConnectDropTarget} function to pass as a `ref` to the drop target element.
 */
export function useDrop(
  spec: FactoryOrInstance<ClarityDropTargetHookSpec>,
  deps?: unknown[]
): [ClarityCollectedProps, ConnectDropTarget] {
  return baseUseDrop(
    typeof spec === 'function' ? () => wrapSpec(spec()) : wrapSpec(spec),
    deps
  )
}

function wrapSpec(
  spec: ClarityDropTargetHookSpec
): DropTargetHookSpec<
  ClarityDragObject,
  ClarityDropResult,
  ClarityCollectedProps
> {
  return {
    accept: DND_ITEM,
    drop: spec.drop,
    canDrop: (item: ClarityDragObject) => {
      return spec.canDrop?.(item) ?? true
    },
    collect: (
      monitor: DropTargetMonitor<ClarityDragObject, ClarityDropResult>
    ) => ({
      tag: monitor.getItem().tag,
      MetadataItem: monitor.getItem().MetadataItem,
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver(),
    }),
  }
}
