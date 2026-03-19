import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center text-foreground">
        <h1 className="text-4xl font-bold mb-4 text-white">404</h1>
        <p className="text-xl text-white/60 mb-4">Página não encontrada</p>
        <Link to="/" className="text-primary hover:text-primary/80 underline transition-colors">
          Voltar ao Início
        </Link>
      </div>
    </div>
  )
}

export default NotFound
