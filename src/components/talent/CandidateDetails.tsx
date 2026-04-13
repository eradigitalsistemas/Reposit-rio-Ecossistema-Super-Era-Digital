import { useCandidateStore } from '@/stores/useCandidateStore'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState, useEffect } from 'react'
import { Brain, Briefcase, Mail, Phone, GraduationCap, X } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

export function CandidateDetails() {
  const { selectedCandidate, isDetailsOpen, setDetailsOpen, updateStatus, setConvertOpen } =
    useCandidateStore()
  const [observations, setObservations] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (selectedCandidate) setObservations(selectedCandidate.observations || '')
  }, [selectedCandidate])

  if (!selectedCandidate) return null

  const handleSaveObservations = async () => {
    setIsSaving(true)
    await updateStatus(selectedCandidate.id, selectedCandidate.status, observations)
    setIsSaving(false)
  }

  const handleStatusChange = (status: string) => {
    updateStatus(selectedCandidate.id, status, observations)
  }

  const disc = selectedCandidate.disc_result?.result || selectedCandidate.disc_result?.tipo_perfil

  return (
    <Sheet open={isDetailsOpen} onOpenChange={setDetailsOpen}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl flex flex-col p-0 bg-background">
        <SheetHeader className="p-6 pb-4 border-b shrink-0 bg-card">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 shadow-sm">
                <AvatarImage
                  src={`https://img.usecurling.com/ppl/thumbnail?seed=${selectedCandidate.id}`}
                />
                <AvatarFallback>
                  {selectedCandidate.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-2xl">{selectedCandidate.name}</SheetTitle>
                <SheetDescription className="text-base font-medium text-primary mt-1">
                  {selectedCandidate.profession || 'Candidato'}
                </SheetDescription>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Select value={selectedCandidate.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[140px] h-9 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Novo">Novo</SelectItem>
                  <SelectItem value="Entrevistado">Entrevistado</SelectItem>
                  <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                  <SelectItem value="Contratado">Contratado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4 pt-2">
            {selectedCandidate.status !== 'Contratado' && (
              <Button onClick={() => setConvertOpen(true)} className="flex-1 sm:flex-none">
                Converter para Colaborador
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => handleStatusChange('Rejeitado')}
              className="flex-1 sm:flex-none text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              Rejeitar
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-8 pb-10">
            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg border">
              <div className="flex items-center gap-3 text-foreground">
                <div className="p-2 bg-background rounded-md shadow-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <span className="font-medium">{selectedCandidate.email}</span>
              </div>
              {selectedCandidate.resume_data?.phone && (
                <div className="flex items-center gap-3 text-foreground">
                  <div className="p-2 bg-background rounded-md shadow-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="font-medium">{selectedCandidate.resume_data.phone}</span>
                </div>
              )}
            </div>

            {/* DISC Test */}
            {disc && (
              <div className="bg-primary/5 rounded-lg p-5 border border-primary/20 flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-full shrink-0">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">
                    Teste Comportamental DISC
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Perfil predominante identificado:{' '}
                    <Badge variant="default" className="ml-1 px-3 py-0.5 text-sm">
                      {disc}
                    </Badge>
                  </p>
                </div>
              </div>
            )}

            {/* Observations */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Observações do Recrutador</Label>
              <Textarea
                placeholder="Adicione notas sobre a entrevista, impressões comportamentais e técnicas..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="min-h-[120px] resize-none focus-visible:ring-primary/50"
              />
              <div className="flex justify-end">
                <Button size="sm" onClick={handleSaveObservations} disabled={isSaving}>
                  {isSaving ? 'Salvando...' : 'Salvar Observações'}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Experience */}
            {selectedCandidate.resume_data?.experience && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 font-semibold text-lg text-foreground">
                  <Briefcase className="h-5 w-5 text-primary" />
                  <h3>Experiência Profissional</h3>
                </div>
                {Array.isArray(selectedCandidate.resume_data.experience) ? (
                  <div className="space-y-6">
                    {selectedCandidate.resume_data.experience.map((exp: any, i: number) => (
                      <div
                        key={i}
                        className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 before:bg-border last:before:bottom-auto last:before:h-full"
                      >
                        <div className="absolute left-[-4px] top-2 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                        <h4 className="font-semibold text-base">{exp.cargo || exp.title}</h4>
                        <p className="text-sm font-medium text-primary/80 mt-0.5">
                          {exp.empresa || exp.company}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 font-medium uppercase tracking-wider">
                          {exp.data_inicio || exp.startDate} •{' '}
                          {exp.data_fim || exp.endDate || 'Atualmente'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/20 p-4 rounded-md border border-dashed">
                    {JSON.stringify(selectedCandidate.resume_data.experience, null, 2)}
                  </p>
                )}
              </div>
            )}

            {/* Education */}
            {selectedCandidate.resume_data?.education && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 font-semibold text-lg text-foreground">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <h3>Formação Acadêmica</h3>
                </div>
                {Array.isArray(selectedCandidate.resume_data.education) ? (
                  <div className="space-y-6">
                    {selectedCandidate.resume_data.education.map((edu: any, i: number) => (
                      <div
                        key={i}
                        className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-0.5 before:bg-border last:before:bottom-auto last:before:h-full"
                      >
                        <div className="absolute left-[-4px] top-2 h-2.5 w-2.5 rounded-full bg-primary/50 ring-4 ring-background" />
                        <h4 className="font-semibold text-base">{edu.curso || edu.degree}</h4>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {edu.instituicao || edu.school}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/20 p-4 rounded-md border border-dashed">
                    {JSON.stringify(selectedCandidate.resume_data.education, null, 2)}
                  </p>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
