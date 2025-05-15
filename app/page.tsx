'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { questions } from '../data/questions'
import { personalityDescriptions } from '../data/personalityDescriptions'
import { PersonalityTrait, PersonalityType } from '../types/personality'

export default function PersonalityTest() {
  const [currentQuestion, setCurrentQuestion] = useState(-2) // -2: 年龄输入, -1: 性别选择, 0+: MBTI问题
  const [answers, setAnswers] = useState<PersonalityTrait[]>([])
  const [result, setResult] = useState<PersonalityType | null>(null)
  const [age, setAge] = useState<string>('')
  const [gender, setGender] = useState<string>('')

  const handleAnswer = (trait: PersonalityTrait) => {
    const newAnswers = [...answers, trait]
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      const personalityType = calculatePersonalityType(newAnswers)
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

  if (result) {
    const personalityResult = personalityDescriptions[result] || { type: result, description: "描述暂未提供。", details: "" }
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
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
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={resetTest} className="w-full sm:w-auto">重新测试</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // 年龄输入页面
  if (currentQuestion === -2) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
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
    );
  }
  
  // 性别选择页面
  if (currentQuestion === -1) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
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
    );
  }
  
  // MBTI问题页面
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
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
  )
}
