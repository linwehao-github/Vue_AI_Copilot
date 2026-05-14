<script setup lang="ts">
import { reactive } from 'vue'
import type { OutfitFormData } from '@/types'

const emit = defineEmits<{
  submit: [data: OutfitFormData]
}>()

const form = reactive<OutfitFormData>({
  profile: {
    gender: '',
    age: null,
    height_cm: null,
    weight_kg: null,
    body_type: '',
  },
  scene: {
    occasion: '',
    city: '',
    weather: '',
    temp_high: null,
    temp_low: null,
    season: '',
  },
  wardrobe: {
    tops: '',
    bottoms: '',
    dresses: '',
    outerwear: '',
    shoes: '',
    accessories: '',
    favorite_colors: '',
    avoid_colors: '',
    favorite_styles: '',
    budget_level: '',
  },
  custom_requirements: '',
})

const genderOptions = ['男', '女']
const bodyTypeOptions = ['标准', '偏瘦', '偏胖', '梨形', '苹果型', '沙漏型', 'H型']
const occasionOptions = ['上班通勤', '约会', '运动健身', '休闲逛街', '正式宴会', '居家']
const weatherOptions = ['晴', '多云', '阴', '雨', '雪']
const seasonOptions = ['春', '夏', '秋', '冬']
const budgetOptions = ['平价', '中端', '轻奢']

function handleSubmit() {
  emit('submit', JSON.parse(JSON.stringify(form)))
}
</script>

<template>
  <form
    class="max-w-2xl mx-auto space-y-6"
    @submit.prevent="handleSubmit"
  >
    <!-- Section 1: 基本信息 -->
    <section class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 class="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        基本信息
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <label class="flex flex-col gap-1">
          <span class="text-sm text-gray-500">性别</span>
          <select v-model="form.profile.gender" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
            <option value="">请选择</option>
            <option v-for="opt in genderOptions" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-sm text-gray-500">年龄</span>
          <input v-model.number="form.profile.age" type="number" min="1" max="120" placeholder="25" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-sm text-gray-500">身高 (cm)</span>
          <input v-model.number="form.profile.height_cm" type="number" min="100" max="220" placeholder="170" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-sm text-gray-500">体重 (kg)</span>
          <input v-model.number="form.profile.weight_kg" type="number" min="30" max="200" placeholder="60" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-sm text-gray-500">体型</span>
          <select v-model="form.profile.body_type" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
            <option value="">请选择</option>
            <option v-for="opt in bodyTypeOptions" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </label>
      </div>
    </section>

    <!-- Section 2: 场景天气 -->
    <section class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 class="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
        场景天气
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <label class="flex flex-col gap-1">
          <span class="text-sm text-gray-500">场合</span>
          <select v-model="form.scene.occasion" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
            <option value="">请选择</option>
            <option v-for="opt in occasionOptions" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-sm text-gray-500">城市</span>
          <input v-model="form.scene.city" type="text" placeholder="北京" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-sm text-gray-500">天气</span>
          <select v-model="form.scene.weather" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
            <option value="">请选择</option>
            <option v-for="opt in weatherOptions" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-sm text-gray-500">最高温度 (°C)</span>
          <input v-model.number="form.scene.temp_high" type="number" min="-30" max="50" placeholder="25" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-sm text-gray-500">最低温度 (°C)</span>
          <input v-model.number="form.scene.temp_low" type="number" min="-30" max="50" placeholder="15" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-sm text-gray-500">季节</span>
          <select v-model="form.scene.season" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
            <option value="">请选择</option>
            <option v-for="opt in seasonOptions" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </label>
      </div>
    </section>

    <!-- Section 3: 衣橱与偏好 -->
    <section class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 class="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        衣橱库存
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label class="flex flex-col gap-1">
          <span class="text-sm text-gray-500">上装</span>
          <textarea v-model="form.wardrobe.tops" rows="2" placeholder="例：白衬衫、黑色打底衫、条纹T恤..." class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-sm text-gray-500">下装</span>
          <textarea v-model="form.wardrobe.bottoms" rows="2" placeholder="例：牛仔裤、黑色直筒裤、A字裙..." class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-sm text-gray-500">连衣裙</span>
          <textarea v-model="form.wardrobe.dresses" rows="2" placeholder="例：小黑裙、碎花连衣裙..." class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-sm text-gray-500">外套</span>
          <textarea v-model="form.wardrobe.outerwear" rows="2" placeholder="例：风衣、牛仔夹克、西装外套..." class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-sm text-gray-500">鞋子</span>
          <textarea v-model="form.wardrobe.shoes" rows="2" placeholder="例：小白鞋、乐福鞋、切尔西靴..." class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-sm text-gray-500">配饰</span>
          <textarea v-model="form.wardrobe.accessories" rows="2" placeholder="例：简约项链、手表、帆布包..." class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" />
        </label>
      </div>

      <h3 class="text-sm font-semibold text-gray-700 mt-5 mb-3">风格偏好</h3>
      <div class="grid grid-cols-2 gap-3">
        <label class="flex flex-col gap-1">
          <span class="text-sm text-gray-500">喜欢的颜色</span>
          <input v-model="form.wardrobe.favorite_colors" type="text" placeholder="黑、白、蓝" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-sm text-gray-500">避开的颜色</span>
          <input v-model="form.wardrobe.avoid_colors" type="text" placeholder="荧光绿" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-sm text-gray-500">喜欢的风格</span>
          <input v-model="form.wardrobe.favorite_styles" type="text" placeholder="简约、通勤、休闲" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-sm text-gray-500">预算水平</span>
          <select v-model="form.wardrobe.budget_level" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
            <option value="">不限</option>
            <option v-for="opt in budgetOptions" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </label>
      </div>
    </section>

    <!-- Section 4: 自定义要求 -->
    <section class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h2 class="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        自定义要求
      </h2>
      <textarea
        v-model="form.custom_requirements"
        rows="3"
        placeholder="例：今天有个重要会议，需要看起来专业一些；或者：腿部较粗希望遮一下..."
        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
      />
    </section>

    <!-- 提交按钮 -->
    <button
      type="submit"
      class="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm
             hover:from-blue-600 hover:to-purple-700 active:scale-[0.99] transition-all shadow-md hover:shadow-lg"
    >
      ✨ 生成穿搭推荐
    </button>
  </form>
</template>
