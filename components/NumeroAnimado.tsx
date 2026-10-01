'use client'

import { useEffect, useState } from 'react'

export default function NumeroAnimado({ valor }: { valor: number }) {
  const [atual, setAtual] = useState(0)

  useEffect(() => {
    let frame: number
    const duracao = 500
    const inicio = performance.now()

    function passo(agora: number) {
      const progresso = Math.min((agora - inicio) / duracao, 1)
      setAtual(Math.round(valor * progresso))
      if (progresso < 1) frame = requestAnimationFrame(passo)
    }

    frame = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(frame)
  }, [valor])

  return <>{atual}</>
}