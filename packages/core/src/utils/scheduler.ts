export type Task = () => void;

export class SimpleScheduler {
  private running: boolean = false;
  private taskGroupQueue: Array<string | symbol> = [];
  private queueMap: Map<string | symbol, Task[]> = new Map();

  /**
   * 启动任务循环
   */

  runloop() {
    if (this.running || !this.taskGroupQueue.length) return;
    this.running = true;
    requestIdleCallback(this.workloop.bind(this));
    this.running = false;
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
    const taskList = this.queueMap.get(groupId);
    if (taskList) {
      taskList.push(...tasks);
    } else {
      this.queueMap.set(groupId, tasks);
      this.taskGroupQueue.push(groupId);
    }
    this.runloop();
  }

  pop() {
    while (this.taskGroupQueue.length) {
      const groupId = this.taskGroupQueue[0];
      const taskList = this.queueMap.get(groupId);
      if (taskList?.length) {
        return taskList.shift()!;
      } else {
        this.taskGroupQueue.shift();
        this.queueMap.delete(groupId);
      }
    }
    return null;
  }

  delete(groupId: string | symbol = "default") {
    this.taskGroupQueue = this.taskGroupQueue.filter((id) => id !== groupId);
    this.queueMap.delete(groupId);
  }
}
