/**
 * 阿里 DashScope wanx-v1 图片生成服务（异步任务模式）
 */
export async function submitTask(prompt: string): Promise<string> {
  const resp = await fetch('/api/image/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'wanx-v1',
      input: { prompt },
      parameters: { size: '1024*1024', n: 1 },
    }),
  })

  if (!resp.ok) {
    throw new Error(`图片生成请求失败 (${resp.status})`)
  }

  const data = await resp.json()
  const taskId = data.output?.task_id
  if (!taskId) {
    throw new Error(`未获取到任务ID: ${JSON.stringify(data)}`)
  }
  return taskId
}

export async function pollTask(taskId: string, maxWait = 120): Promise<string> {
  const start = Date.now()
  while (Date.now() - start < maxWait * 1000) {
    await sleep(2000)

    const resp = await fetch(`/api/image/task/${taskId}`)
    if (!resp.ok) {
      throw new Error(`查询任务状态失败 (${resp.status})`)
    }

    const data = await resp.json()
    const status = data.output?.task_status

    if (status === 'SUCCEEDED') {
      const results = data.output?.results ?? []
      const url = results[0]?.url
      if (!url) throw new Error('任务成功但未返回图片URL')
      return url
    }

    if (status === 'FAILED') {
      throw new Error(data.output?.message ?? '图片生成任务失败')
    }
  }
  throw new Error('图片生成超时，请重试')
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export async function generateImage(prompt: string): Promise<string> {
  const taskId = await submitTask(prompt)
  return pollTask(taskId)
}
