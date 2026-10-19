import type { Task } from "@/types/utils";

export class SimpleScheduler {
  private _running: boolean = false;
  private _taskGroupQueue: Array<string | symbol> = [];
  private _queueMap: Map<string | symbol, Task[]> = new Map();

  /**
   * 启动任务循环
   */

  runloop() {
    if (this._running || !this._taskGroupQueue.length) return;
    this._running = true;
    requestIdleCallback(this.workloop.bind(this));
    this._running = false;
  }

  /**
   * 任务循环
   * @param deadline requestIdleCallback 的 deadline 对象
   */
  async workloop(deadline: IdleDeadline) {
    let shouldYield = false;
    let task = this.pop();

    while (task && !shouldYield) {
      await task();
      shouldYield = deadline.timeRemaining() < 1;
      if (!shouldYield) task = this.pop();
    }

    this.runloop();
  }

  add(task: Task | Task[], groupId: string | symbol = "default") {
    const tasks = task instanceof Array ? task : [task];
    const taskList = this._queueMap.get(groupId);
    if (taskList) {
      taskList.push(...tasks);
    } else {
      this._queueMap.set(groupId, tasks);
      this._taskGroupQueue.push(groupId);
    }
    this.runloop();
  }

  pop() {
    while (this._taskGroupQueue.length) {
      const groupId = this._taskGroupQueue[0];
      const taskList = this._queueMap.get(groupId);
      if (taskList?.length) {
        return taskList.shift()!;
      } else {
        this._taskGroupQueue.shift();
        this._queueMap.delete(groupId);
      }
    }
    return null;
  }

  delete(groupId: string | symbol = "default") {
    this._taskGroupQueue = this._taskGroupQueue.filter((id) => id !== groupId);
    this._queueMap.delete(groupId);
  }
}
