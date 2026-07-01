const Log = require("../logging-middleware/logger");

const WEIGHTS = {
  "Placement": 3,
  "Result": 2,
  "Event": 1
};

// Min-Heap (Priority Queue) Implementation
class PriorityQueue {
  constructor(compare) {
    this.heap = [];
    this.compare = compare;
  }
  
  push(val) {
    this.heap.push(val);
    this.up(this.heap.length - 1);
  }
  
  pop() {
    if (this.heap.length === 0) return null;
    const top = this.heap[0];
    const bottom = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this.down(0);
    }
    return top;
  }
  
  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }
  
  size() {
    return this.heap.length;
  }
  
  up(i) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.compare(this.heap[i], this.heap[p]) < 0) {
        this.swap(i, p);
        i = p;
      } else {
        break;
      }
    }
  }
  
  down(i) {
    const len = this.heap.length;
    while ((i << 1) + 1 < len) {
      let child = (i << 1) + 1;
      if (child + 1 < len && this.compare(this.heap[child + 1], this.heap[child]) < 0) {
        child++;
      }
      if (this.compare(this.heap[child], this.heap[i]) < 0) {
        this.swap(i, child);
        i = child;
      } else {
        break;
      }
    }
  }
  
  swap(i, j) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}

// Compare two notifications to find which has lower priority (for min-heap)
function comparePriority(a, b) {
  const weightA = WEIGHTS[a.Type] || 0;
  const weightB = WEIGHTS[b.Type] || 0;
  
  if (weightA !== weightB) {
    return weightA - weightB; // Lower weight = lower priority
  }
  
  const timeA = new Date(a.Timestamp).getTime();
  const timeB = new Date(b.Timestamp).getTime();
  return timeA - timeB; // Older timestamp = lower priority
}

async function fetchNotifications() {
  const token = await Log.getToken();
  try {
    let response = await fetch("http://4.224.186.213/evaluation-service/notifications", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    let text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { message: text };
    }

    if (data.message === "invalid authorization token") {
      console.log("Token expired, refreshing token...");
      const refreshedToken = await Log.refreshToken();
      response = await fetch("http://4.224.186.213/evaluation-service/notifications", {
        headers: {
          "Authorization": `Bearer ${refreshedToken}`
        }
      });
      data = await response.json();
    }
    
    return data.notifications || [];
  } catch (error) {
    console.error("Failed to fetch notifications:", error.message);
    return [];
  }
}

async function main() {
  await Log("frontend", "info", "api", "Fetching notifications to determine top 10 priority");
  
  const notifications = await fetchNotifications();
  console.log(`Fetched ${notifications.length} total notifications.`);
  
  // Find top 10 priority notifications using the Priority Queue
  const K = 10;
  const pq = new PriorityQueue(comparePriority);
  
  for (const n of notifications) {
    if (pq.size() < K) {
      pq.push(n);
    } else if (comparePriority(n, pq.peek()) > 0) {
      pq.pop();
      pq.push(n);
    }
  }
  
  // Retrieve priority notifications from the heap
  const priorityList = [];
  while (pq.size() > 0) {
    priorityList.push(pq.pop());
  }
  
  // Reverse to get highest priority first
  priorityList.reverse();
  
  console.log("\n=================== TOP 10 PRIORITY NOTIFICATIONS ===================");
  priorityList.forEach((n, index) => {
    console.log(`${index + 1}. [${n.Type}] - ${n.Message} (${n.Timestamp})`);
  });
  console.log("======================================================================\n");
  
  await Log("frontend", "info", "api", `Determined top 10 priority notifications successfully`);
}

main();
