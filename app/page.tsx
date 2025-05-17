'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { questions } from '../data/questions'
import { personalityDescriptions } from '../data/personalityDescriptions'
import { PersonalityTrait, PersonalityType, ArtStyle } from '../types/personality'

export default function PersonalityTest() {
  // 更新页脚年份
  useEffect(() => {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear().toString();
    }
  }, []);
  const [currentQuestion, setCurrentQuestion] = useState(-2) // -2: 年龄输入, -1: 性别选择, 0+: MBTI问题
  const [answers, setAnswers] = useState<PersonalityTrait[]>([])
  const [result, setResult] = useState<PersonalityType | null>(null)
  const [age, setAge] = useState<string>('')
  const [gender, setGender] = useState<string>('')
  const [artStyle, setArtStyle] = useState<ArtStyle | null>(null)
  const [showArtStyleSelection, setShowArtStyleSelection] = useState(false)

  const handleAnswer = (trait: PersonalityTrait) => {
    const newAnswers = [...answers, trait]
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      const personalityType = calculatePersonalityType(newAnswers)
      setShowArtStyleSelection(true)
      setResult(personalityType)
    }
  }

  const calculatePersonalityType = (answers: PersonalityTrait[]): PersonalityType => {
    const counts: Record<PersonalityTrait, number> = {
      'E': 0, 'I': 0, 'S': 0, 'N': 0, 'T': 0, 'F': 0, 'J': 0, 'P': 0
    }

    answers.forEach(trait => counts[trait]++)

    const type = `${counts['E'] > counts['I'] ? 'E' : 'I'}${counts['S'] > counts['N'] ? 'S' : 'N'}${counts['T'] > counts['F'] ? 'T' : 'F'}${counts['J'] > counts['P'] ? 'J' : 'P'}` as PersonalityType

    return type
  }

  const resetTest = () => {
    setCurrentQuestion(-2)
    setAnswers([])
    setResult(null)
    setAge('')
    setGender('')
    setArtStyle(null)
    setShowArtStyleSelection(false)
  }
  
  const handleArtStyleSelect = (style: ArtStyle) => {
    setArtStyle(style)
    setShowArtStyleSelection(false)
  }
  
  const generateImagePrompt = (type: PersonalityType, style: ArtStyle | null) => {
    if (!style) return '';
    
    const personalityResult = personalityDescriptions[type] || { type, description: "描述暂未提供。", details: "" }
    
    // 提取霍兰德职业倾向代码
    const careerCode = personalityResult.career ? 
      personalityResult.career.match(/职业倾向：([^\(]+)\(([^\)]+)\)和([^\(]+)\(([^\)]+)\)/) : null;
    
    const hollandCodes = careerCode ? `${careerCode[1]}(${careerCode[2]})和${careerCode[3]}(${careerCode[4]})` : '';
    
    // 从details中提取关键特质
    const traits = personalityResult.details ? 
      personalityResult.details.replace('作为' + type + ',你是一个', '').split('。')[0] : '';
    
    // 提取职业示例
    const careerExamples = personalityResult.career ? 
      personalityResult.career.match(/如([^。]+)/) : null;
    const careers = careerExamples ? careerExamples[1].split('、').slice(0, 3).join('、') : '';
    
    // 根据人格类型确定适合的场景和活动
    let scenario = '';
    if (type.includes('E')) {
      scenario += '在充满活力的团队会议或社交活动中，';
    } else if (type.includes('I')) {
      scenario += '在安静的个人工作空间或小型深度交流场合中，';
    }
    
    if (type.includes('S')) {
      scenario += '专注于收集和分析具体数据与实际细节，';
    } else if (type.includes('N')) {
      scenario += '沉浸于探索创新概念和未来可能性的思考中，';
    }
    
    if (type.includes('T')) {
      scenario += '运用逻辑框架和客观分析做出理性决策，';
    } else if (type.includes('F')) {
      scenario += '以同理心和价值观为基础考虑人际影响和情感需求，';
    }
    
    if (type.includes('J')) {
      scenario += '按照精心规划的结构和明确的目标有序行动，';
    } else if (type.includes('P')) {
      scenario += '保持开放心态灵活应对变化和新机会，';
    }
    
    // 根据霍兰德代码添加工作环境描述
    let workEnvironment = '';
    if (hollandCodes.includes('研究型')) {
      workEnvironment += '在充满智力挑战的研究环境中，专注于分析复杂问题和开发创新解决方案；';
    } else if (hollandCodes.includes('艺术型')) {
      workEnvironment += '在富有创意和表现力的工作环境中，自由发挥想象力和审美能力；';
    } else if (hollandCodes.includes('社会型')) {
      workEnvironment += '在以人为本的服务环境中，致力于帮助、教育和支持他人的成长与发展；';
    } else if (hollandCodes.includes('企业型')) {
      workEnvironment += '在充满挑战的领导岗位上，展现决策力和影响力，推动团队实现目标；';
    } else if (hollandCodes.includes('常规型')) {
      workEnvironment += '在结构化和有序的工作环境中，精确处理数据和细节，确保系统高效运行；';
    } else if (hollandCodes.includes('实用型')) {
      workEnvironment += '在需要动手能力和技术专长的领域中，解决具体问题并创造有形成果；';
    }
    
    // 根据年龄添加职业阶段描述
    let careerStage = '';
    if (parseInt(age) < 25) {
      careerStage = '正处于职业探索和技能培养阶段，';
    } else if (parseInt(age) < 35) {
      careerStage = '正在职业发展道路上积累经验和专业知识，';
    } else if (parseInt(age) < 50) {
      careerStage = '已在职业领域建立了专业声誉和影响力，';
    } else {
      careerStage = '拥有丰富的职业经验和智慧，可能处于指导和传承阶段，';
    }
    
    // 组合成详细的prompt
    return `一个${age}岁${gender}的${type}类型(${personalityResult.name})人格，${traits}。${scenario}\n\n这位人物${careerStage}体现了${hollandCodes}的职业倾向，适合从事${careers}等工作。${workEnvironment}\n\n${personalityResult.description}\n\n请以${style}风格呈现这个人物形象，展现其在专业环境中的独特气质、内在特质和职业特点。画面应包含能体现其职业倾向的场景元素和细节，如工作环境、专业工具或互动场景。`
  }
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('已复制到剪贴板！')
      })
      .catch(err => {
        console.error('复制失败：', err)
        alert('复制失败，请手动复制。')
      })
  }
  
  const handleAgeSubmit = () => {
    if (age.trim() !== '') {
      setCurrentQuestion(-1)
    }
  }
  
  const handleGenderSubmit = (selectedGender: string) => {
    setGender(selectedGender)
    setCurrentQuestion(0)
  }

  // 文生图风格选择页面
  if (result && showArtStyleSelection) {
    const artStyles: ArtStyle[] = [
      '线稿', '铅笔', '水墨', '复古漫画',
      '彩铅', '蜡笔', '点彩', '水彩',
      '毛毡', '毛线', '粘土', '纸艺',
      '像素', '史努比', 'riso印刷', '写实'
    ];
    
    const styleCategories = [
      { name: '基础线条与黑白风格', styles: artStyles.slice(0, 4) },
      { name: '彩色手绘风格', styles: artStyles.slice(4, 8) },
      { name: '立体与质感风格', styles: artStyles.slice(8, 12) },
      { name: '特殊效果与写实风格', styles: artStyles.slice(12, 16) }
    ];
    
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        {/* 页面介绍 */}
        <div className="w-full bg-white p-4 shadow-sm mb-4 text-center">
          <h1 className="text-2xl font-bold mb-2">MBTI人格测试</h1>
          <p className="text-gray-600">探索你的性格特质，了解自己的优势和潜力。这个测试将帮助你发现适合的职业方向和个人发展路径。</p>
        </div>
        
        <div className="flex-grow flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl text-center">选择文生图风格</CardTitle>
            <CardDescription className="text-lg text-center mt-4">请选择一种您喜欢的文生图风格</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              {styleCategories.map((category, index) => (
                <div key={index} className="space-y-3">
                  <h3 className="text-lg font-medium">{category.name}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {category.styles.map((style) => (
                      <Button 
                        key={style} 
                        variant="outline" 
                        className="justify-start text-left h-auto py-3"
                        onClick={() => handleArtStyleSelect(style)}
                      >
                        {style}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>
        
        {/* 页脚 */}
        <footer className="w-full bg-white p-4 shadow-sm mt-auto text-center text-gray-600">
          &copy; <span id="currentYear">2025</span> XiuXin&apos;Inc | 由 <a 
            href="https://ikxiuxin.com/" className="text-blue-500 hover:underline">XiuXin Inc</a> 强力驱动 
        </footer>
      </div>
    );
  }
  
  if (result && !showArtStyleSelection) {
    const personalityResult = personalityDescriptions[result] || { type: result, description: "描述暂未提供。", details: "" }
    const imagePrompt = generateImagePrompt(result, artStyle);
    
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        {/* 页面介绍 */}
        <div className="w-full bg-white p-4 shadow-sm mb-4 text-center">
          <h1 className="text-2xl font-bold mb-2">MBTI人格测试</h1>
          <p className="text-gray-600">探索你的性格特质，了解自己的优势和潜力。这个测试将帮助你发现适合的职业方向和个人发展路径。</p>
        </div>
        
        <div className="flex-grow flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl text-center">作为{age}岁{gender}的{result}类型</CardTitle>
            <CardDescription className="text-lg text-center mt-4">{personalityResult.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-md mt-4">{personalityResult.details}</p>
            {personalityResult.career && (
              <p className="text-md mt-4">{personalityResult.career}</p>
            )}
            
            {artStyle && (
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">文生图提示词</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(imagePrompt)}
                  >
                    复制
                  </Button>
                </div>
                <p className="text-sm text-gray-700">{imagePrompt}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={resetTest} className="w-full sm:w-auto">重新测试</Button>
          </CardFooter>
        </Card>
        </div>
        
        {/* 页脚 */}
        <footer className="w-full bg-white p-4 shadow-sm mt-auto text-center text-gray-600">
          &copy; <span id="currentYear">2025</span> XiuXin&apos;Inc | 由 <a 
            href="https://ikxiuxin.com/" className="text-blue-500 hover:underline">XiuXin Inc</a> 强力驱动 
        </footer>
      </div>
    )
  }

  // 年龄输入页面
  if (currentQuestion === -2) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        {/* 页面介绍 */}
        <div className="w-full bg-white p-4 shadow-sm mb-4 text-center">
          <h1 className="text-2xl font-bold mb-2">MBTI人格测试</h1>
          <p className="text-gray-600">探索你的性格特质，了解自己的优势和潜力。这个测试将帮助你发现适合的职业方向和个人发展路径。</p>
        </div>
        
        <div className="flex-grow flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl text-center">人格测试</CardTitle>
              <CardDescription className="text-lg text-center mt-2">请输入您的年龄</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleAgeSubmit(); }}>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="age" className="text-xl text-left mb-4">年龄</Label>
                    <input 
                      type="number" 
                      id="age" 
                      value={age} 
                      onChange={(e) => setAge(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="请输入您的年龄"
                      min="1"
                      max="120"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-center mt-6">
                  <Button type="submit" className="w-full sm:w-auto" disabled={!age}>继续</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        {/* 页脚 */}
        <footer className="w-full bg-white p-4 shadow-sm mt-auto text-center text-gray-600">
          &copy; <span id="currentYear">2025</span> XiuXin&apos;Inc | 由 <a 
            href="https://ikxiuxin.com/" className="text-blue-500 hover:underline">XiuXin Inc</a> 强力驱动 
        </footer>
      </div>
    );
  }
  
  // 性别选择页面
  if (currentQuestion === -1) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        {/* 页面介绍 */}
        <div className="w-full bg-white p-4 shadow-sm mb-4 text-center">
          <h1 className="text-2xl font-bold mb-2">MBTI人格测试</h1>
          <p className="text-gray-600">探索你的性格特质，了解自己的优势和潜力。这个测试将帮助你发现适合的职业方向和个人发展路径。</p>
        </div>

        <div className="flex-grow flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl text-center">人格测试</CardTitle>
              <CardDescription className="text-lg text-center mt-2">请选择您的性别</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="gender" className="text-xl text-left mb-4">性别</Label>
                  <RadioGroup onValueChange={(value) => handleGenderSubmit(value)} className="flex flex-col space-y-2">
                    <label className="flex items-center space-x-2 justify-start">
                      <RadioGroupItem value="男性" id="male" />
                      <Label htmlFor="male" className="text-lg cursor-pointer">男性</Label>
                    </label>
                    <label className="flex items-center space-x-2 justify-start">
                      <RadioGroupItem value="女性" id="female" />
                      <Label htmlFor="female" className="text-lg cursor-pointer">女性</Label>
                    </label>
                    <label className="flex items-center space-x-2 justify-start">
                      <RadioGroupItem value="其他" id="other" />
                      <Label htmlFor="other" className="text-lg cursor-pointer">其他</Label>
                    </label>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 页脚 */}
        <footer className="w-full bg-white p-4 shadow-sm mt-auto text-center text-gray-600">
          &copy; <span id="currentYear">2025</span> XiuXin&apos;Inc | 由 <a 
            href="https://ikxiuxin.com/" className="text-blue-500 hover:underline">XiuXin Inc</a> 强力驱动 
        </footer>
      </div>
    );
  }
  
  // MBTI问题页面
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* 页面介绍 */}
      <div className="w-full bg-white p-4 shadow-sm mb-4 text-center">
        <h1 className="text-2xl font-bold mb-2">MBTI人格测试</h1>
        <p className="text-gray-600">探索你的性格特质，了解自己的优势和潜力。这个测试将帮助你发现适合的职业方向和个人发展路径。</p>
      </div>
      
      <div className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl text-center">人格测试</CardTitle>
          <CardDescription className="text-lg text-center mt-2">问题 {currentQuestion + 1} / {questions.length}</CardDescription>
          <Progress value={(currentQuestion + 1) / questions.length * 100} className="mt-4" />
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="question" className="text-xl text-left mb-4">{questions[currentQuestion].text}</Label>
                <RadioGroup onValueChange={(value) => handleAnswer(value as PersonalityTrait)} className="flex flex-col space-y-2">
                  {Object.entries(questions[currentQuestion].options).map(([trait, option]) => (
                    <label key={trait} className="flex items-center space-x-2 justify-start">
                      <RadioGroupItem value={trait} id={`option-${trait}`} />
                      <Label htmlFor={`option-${trait}`} className="text-lg cursor-pointer">{option}</Label>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
      
      {/* 页脚 */}
      <footer className="w-full bg-white p-4 shadow-sm mt-auto text-center text-gray-600">
        &copy; <span id="currentYear">2025</span> XiuXin&apos;Inc | 由 <a 
          href="https://ikxiuxin.com/" className="text-blue-500 hover:underline">XiuXin Inc</a> 强力驱动 
      </footer>
    </div>
  )
}
