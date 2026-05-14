import type { OutfitFormData, OutfitRecommendation } from '@/types'

const SYSTEM_PROMPT = `你是一位资深时尚穿搭顾问，精通配色、体型修饰、面料搭配和场景着装规范。

## 你的任务
根据用户提供的个人信息、场景天气、衣橱库存和偏好，生成 2-3 套当日穿搭方案。

## 输出格式
你必须严格输出以下 JSON 格式（不要包含其他文字）：

{
  "recommendations": [
    {
      "style_tag": "风格标签（如：极简通勤、温柔优雅、休闲街头）",
      "description": "搭配解读，2-3句话说明为什么这套搭配合适",
      "items": [
        {"category": "上装", "name": "单品名称", "source": "衣橱", "reason": "选择理由"},
        {"category": "下装", "name": "单品名称", "source": "建议购买", "reason": "选择理由"},
        {"category": "外套", "name": "单品名称", "source": "衣橱", "reason": "选择理由"},
        {"category": "鞋子", "name": "单品名称", "source": "衣橱", "reason": "选择理由"},
        {"category": "配饰", "name": "单品名称", "source": "建议购买", "reason": "选择理由"}
      ],
      "image_prompt": "英文AI生图提示词，格式：A {gender} wearing {detailed outfit}, full body outfit photo, fashion photography, clean background, realistic style, 4k"
    }
  ]
}

## 搭配规则
- 全身主色不超过 3 个（不含黑白灰）
- 根据体型选择扬长避短的版型（梨形平衡上半身、苹果型遮挡腹部、H型制造曲线等）
- 根据温度决定厚薄和层数（<10°C厚外套，10-20°C薄外套，20-30°C单衣，>30°C清凉）
- 场合正式度：正式宴会 > 上班通勤 > 约会 > 休闲逛街 > 运动健身 > 居家
- 雨天避开麂皮/真丝等易湿材质，大风天避免宽松飘逸款
- 用户明确避开的颜色/风格坚决不推荐

## image_prompt 要求
- 必须是英文，详细描述服装款式、颜色、搭配
- 包含 full body outfit photo, fashion photography, clean background, realistic style
- 准确反映整套搭配的所有单品`

function formatFormData(form: OutfitFormData): string {
  const { profile, scene, wardrobe, custom_requirements } = form

  return `请根据以下信息为我推荐今日穿搭：

【基本信息】
性别：${profile.gender || '未填'}
年龄：${profile.age ?? '未填'} 岁
身高：${profile.height_cm ?? '未填'} cm
体重：${profile.weight_kg ?? '未填'} kg
体型：${profile.body_type || '未填'}

【场景天气】
场合：${scene.occasion || '未填'}
城市：${scene.city || '未填'}
天气：${scene.weather || '未填'}
最高温度：${scene.temp_high ?? '未填'}°C
最低温度：${scene.temp_low ?? '未填'}°C
季节：${scene.season || '未填'}

【衣橱库存】
上装：${wardrobe.tops || '无'}
下装：${wardrobe.bottoms || '无'}
连衣裙：${wardrobe.dresses || '无'}
外套：${wardrobe.outerwear || '无'}
鞋子：${wardrobe.shoes || '无'}
配饰：${wardrobe.accessories || '无'}

【偏好】
喜欢的颜色：${wardrobe.favorite_colors || '不限'}
避开的颜色：${wardrobe.avoid_colors || '无'}
喜欢的风格：${wardrobe.favorite_styles || '不限'}
预算水平：${wardrobe.budget_level || '不限'}

【额外要求】
${custom_requirements || '无特殊要求'}

请生成 2-3 套穿搭推荐。`
}

function parseResponse(content: string): OutfitRecommendation[] {
  // 尝试直接解析整个内容为 JSON
  try {
    const parsed = JSON.parse(content)
    if (parsed.recommendations) return parsed.recommendations
  } catch {
    // 继续尝试其他方式
  }

  // 尝试提取 JSON 块
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1].trim())
      if (parsed.recommendations) return parsed.recommendations
    } catch {
      // 继续尝试
    }
  }

  // 尝试找到 JSON 对象
  const jsonObjMatch = content.match(/\{[\s\S]*"recommendations"[\s\S]*\}/)
  if (jsonObjMatch) {
    try {
      const parsed = JSON.parse(jsonObjMatch[0])
      if (parsed.recommendations) return parsed.recommendations
    } catch {
      // 继续尝试
    }
  }

  throw new Error('无法解析AI返回的穿搭推荐，请重试')
}

export async function getOutfitRecommendations(
  formData: OutfitFormData,
): Promise<OutfitRecommendation[]> {
  const userMessage = formatFormData(formData)

  const resp = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen3-max',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      stream: false,
    }),
  })

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '')
    throw new Error(`AI 请求失败 (${resp.status}): ${errText}`)
  }

  const data = await resp.json()
  const content: string = data.choices?.[0]?.message?.content ?? ''
  if (!content) {
    throw new Error('AI 返回为空')
  }

  return parseResponse(content)
}
