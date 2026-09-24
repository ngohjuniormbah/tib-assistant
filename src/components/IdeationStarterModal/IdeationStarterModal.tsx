'use client';

import {
  faBookOpen,
  faFingerprint,
  faLightbulb,
  faMagnifyingGlass,
  faSearch,
  faShieldHalved,
  faTable,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Alert,
  Button,
  Chip,
  Description,
  Input,
  Label,
  Modal,
  Spinner,
  Tabs,
  TextArea,
  TextField,
} from '@heroui/react';
import { FormEvent, useState } from 'react';

import {
  checkPriorArtCollision,
  mineOrkgProblemGaps,
  OrkgProblemSummary,
  PriorArtCollisionCheck,
  searchOrkgProblems,
} from '@/services/orkgDiscovery';

export type IdeationStarterModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelectStarter: (prompt: string) => void;
};

export default function IdeationStarterModal({
  isOpen,
  onOpenChange,
  onSelectStarter,
}: IdeationStarterModalProps) {
  const [selectedTab, setSelectedTab] = useState<string>('orkg');
  const [doi, setDoi] = useState('');
  const [orcid, setOrcid] = useState('');
  const [topic, setTopic] = useState('');

  // ORKG Graph Search state
  const [orkgProblemQuery, setOrkgProblemQuery] = useState('');
  const [isSearchingOrkg, setIsSearchingOrkg] = useState(false);
  const [orkgProblems, setOrkgProblems] = useState<OrkgProblemSummary[]>([]);
  const [selectedOrkgProblem, setSelectedOrkgProblem] =
    useState<OrkgProblemSummary | null>(null);
  const [isMiningGaps, setIsMiningGaps] = useState(false);

  // Prior-Art Collision Audit state
  const [auditHypothesis, setAuditHypothesis] = useState('');
  const [auditKeywords, setAuditKeywords] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<PriorArtCollisionCheck | null>(
    null
  );

  const handleDoiSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!doi.trim()) return;
    onSelectStarter(
      `Please analyze foundational paper DOI: ${doi.trim()} using Crossref and Semantic Scholar. Extract its core contribution, documented limitations, and unexplored boundary conditions. Formulate 3 publication-grade, falsifiable research hypotheses addressing these exact gaps.`
    );
  };

  const handleOrcidSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!orcid.trim()) return;
    onSelectStarter(
      `Please inspect my scholarly trajectory using ORCID: ${orcid.trim()} with the ORCID tool. Identify unexplored intersections across my publications, detect emerging methodological gaps, and propose 3 high-impact future research avenues.`
    );
  };

  const handleTopicSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onSelectStarter(
      `Investigate the scientific frontier of "${topic.trim()}" across Semantic Scholar and ORKG. Identify 3 critical unsolved knowledge gaps, and formulate concrete hypotheses, baseline comparisons, and benchmark evaluation protocols.`
    );
  };

  const handleSearchOrkgProblems = async (e: FormEvent) => {
    e.preventDefault();
    if (!orkgProblemQuery.trim()) return;
    setIsSearchingOrkg(true);
    setOrkgProblems([]);
    setSelectedOrkgProblem(null);

    const results = await searchOrkgProblems(orkgProblemQuery.trim());
    setOrkgProblems(results);
    setIsSearchingOrkg(false);
  };

  const handleSelectProblemAndSynthesize = async (
    problem: OrkgProblemSummary
  ) => {
    setSelectedOrkgProblem(problem);
    setIsMiningGaps(true);

    const gapReport = await mineOrkgProblemGaps(problem.id);
    setIsMiningGaps(false);

    const propertiesText =
      gapReport && gapReport.evaluatedProperties.length > 0
        ? `Observed benchmark properties in ORKG: ${gapReport.evaluatedProperties.join(', ')}.`
        : 'Pioneer area with few structured comparisons in ORKG.';

    onSelectStarter(
      `I want to formulate new research directions for the ORKG research problem "${problem.label}" (ID: ${problem.id}). ${propertiesText} Formulate 3 publication-grade, falsifiable research hypotheses with target benchmark datasets that break past current limitations.`
    );
  };

  const handleRunCollisionAudit = async (e: FormEvent) => {
    e.preventDefault();
    if (!auditHypothesis.trim()) return;
    setIsAuditing(true);
    setAuditResult(null);

    const keywords = auditKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    const result = await checkPriorArtCollision(auditHypothesis, keywords);
    setAuditResult(result);
    setIsAuditing(false);
  };

  const handleAdoptAuditToChat = () => {
    if (!auditResult) return;
    const collisionList = auditResult.potentialCollisions
      .map((c) => `- "${c.title}" (${c.similarityHint})`)
      .join('\n');

    onSelectStarter(
      `I want to refine this hypothesis for publication: "${auditHypothesis}". Prior-art collision audit scored novelty at ${auditResult.noveltyScore}% (${auditResult.verdict.replace('_', ' ')}). Potentially overlapping literature:\n${collisionList || 'None detected.'}\n\nPlease perform an adversarial critique (Reviewer 2 stress-test) and suggest 3 high-novelty pivots to maximize distinctiveness.`
    );
  };

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container placement="top">
        <Modal.Dialog className="max-w-3xl">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faLightbulb} className="text-muted" />
                <span>Research Ideation Studio</span>
              </div>
            </Modal.Heading>
          </Modal.Header>

          <Modal.Body className="flex flex-col gap-4">
            <p className="text-sm text-muted">
              Ground hypothesis formulation in peer-reviewed literature, ORKG
              benchmark graphs, or run real-time prior-art collision audits:
            </p>

            <Tabs
              selectedKey={selectedTab}
              onSelectionChange={(key) => setSelectedTab(key as string)}
              className="gap-0!"
            >
              <Tabs.ListContainer>
                <Tabs.List
                  aria-label="Ideation Studio Modes"
                  className="w-full flex-wrap"
                >
                  <Tabs.Tab id="orkg" className="gap-2">
                    <FontAwesomeIcon icon={faTable} />
                    <span>ORKG Benchmark Graph</span>
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="collision" className="gap-2">
                    <FontAwesomeIcon icon={faShieldHalved} />
                    <span>Prior-Art Collision Audit</span>
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="doi" className="gap-2">
                    <FontAwesomeIcon icon={faBookOpen} />
                    <span>Seed DOI</span>
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="topic" className="gap-2">
                    <FontAwesomeIcon icon={faSearch} />
                    <span>Topic Frontier</span>
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="orcid" className="gap-2">
                    <FontAwesomeIcon icon={faFingerprint} />
                    <span>ORCID Profile</span>
                    <Tabs.Indicator />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>

              {/* ORKG Graph Mining Tab */}
              <Tabs.Panel id="orkg" className="pt-4 space-y-4">
                <form
                  onSubmit={handleSearchOrkgProblems}
                  className="flex gap-2 items-end"
                >
                  <TextField className="flex-1 flex flex-col gap-1.5">
                    <Label className="text-sm font-semibold text-foreground">
                      Search Research Problem in ORKG
                    </Label>
                    <Input
                      placeholder="e.g. Question Answering, Protein Folding, Semantic Parsing"
                      value={orkgProblemQuery}
                      onChange={(e) => setOrkgProblemQuery(e.target.value)}
                      required
                    />
                  </TextField>
                  <Button
                    type="submit"
                    variant="primary"
                    isDisabled={isSearchingOrkg || !orkgProblemQuery.trim()}
                  >
                    {isSearchingOrkg ? (
                      <Spinner size="sm" color="current" />
                    ) : (
                      <FontAwesomeIcon icon={faMagnifyingGlass} />
                    )}
                    <span>Search ORKG</span>
                  </Button>
                </form>

                {orkgProblems.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-muted">
                      Select an ORKG Problem Graph to Mine Benchmark Gaps:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                      {orkgProblems.map((problem) => (
                        <div
                          key={problem.id}
                          className="p-3 rounded-xl border border-border bg-surface-secondary/40 hover:bg-surface-secondary cursor-pointer transition flex items-center justify-between gap-2"
                          onClick={() =>
                            handleSelectProblemAndSynthesize(problem)
                          }
                        >
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-sm truncate text-foreground">
                              {problem.label}
                            </span>
                            <span className="text-xs text-muted font-mono">
                              ID: {problem.id}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            isPending={
                              isMiningGaps &&
                              selectedOrkgProblem?.id === problem.id
                            }
                          >
                            Mine Gaps
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Tabs.Panel>

              {/* Prior-Art Collision Audit Tab */}
              <Tabs.Panel id="collision" className="pt-4 space-y-4">
                <form
                  onSubmit={handleRunCollisionAudit}
                  className="flex flex-col gap-3"
                >
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-semibold text-foreground">
                      Candidate Hypothesis to Audit
                    </Label>
                    <TextArea
                      rows={2}
                      placeholder="e.g. Integrating neuro-symbolic knowledge graphs with diffusion decoders reduces hallucinations in biomedical relation extraction."
                      value={auditHypothesis}
                      onChange={(e) => setAuditHypothesis(e.target.value)}
                      required
                    />
                    <Description className="text-xs text-muted">
                      Checks against recent publications in Semantic Scholar and
                      ORKG to detect overlapping prior art.
                    </Description>
                  </div>

                  <TextField className="flex flex-col gap-1">
                    <Label className="text-xs font-semibold text-foreground">
                      Key Domain Keywords (Comma Separated)
                    </Label>
                    <Input
                      placeholder="e.g. neuro-symbolic, hallucination, biomedical relation"
                      value={auditKeywords}
                      onChange={(e) => setAuditKeywords(e.target.value)}
                    />
                  </TextField>

                  <div className="flex justify-end pt-1">
                    <Button
                      type="submit"
                      variant="primary"
                      isDisabled={isAuditing || !auditHypothesis.trim()}
                    >
                      {isAuditing ? (
                        <Spinner size="sm" color="current" />
                      ) : (
                        <FontAwesomeIcon icon={faShieldHalved} />
                      )}
                      <span>Audit Prior-Art Collision</span>
                    </Button>
                  </div>
                </form>

                {auditResult && (
                  <div className="p-4 rounded-xl border border-border bg-surface-secondary/40 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">
                          Novelty Score:
                        </span>
                        <Chip size="sm">{auditResult.noveltyScore}%</Chip>
                        <Chip size="sm">
                          {auditResult.verdict.replace('_', ' ').toUpperCase()}
                        </Chip>
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        onPress={handleAdoptAuditToChat}
                      >
                        Refine & Defend in Chat
                      </Button>
                    </div>

                    {auditResult.potentialCollisions.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-xs font-semibold text-muted">
                          Closely Related Prior Art Detected:
                        </span>
                        <ul className="text-xs space-y-1.5 list-disc list-inside text-muted">
                          {auditResult.potentialCollisions.map((col, idx) => (
                            <li key={idx}>
                              <span className="font-medium text-foreground">
                                {col.title}
                              </span>
                              <span className="ml-1 text-muted">
                                ({col.similarityHint})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <Alert>
                        <Alert.Indicator />
                        <Alert.Content>
                          <Alert.Description>
                            No direct conceptual collisions found in recent top
                            venues. High novelty clearance.
                          </Alert.Description>
                        </Alert.Content>
                      </Alert>
                    )}
                  </div>
                )}
              </Tabs.Panel>

              {/* Seed DOI Tab */}
              <Tabs.Panel id="doi" className="pt-4">
                <form
                  onSubmit={handleDoiSubmit}
                  className="flex flex-col gap-4"
                >
                  <TextField className="w-full flex flex-col gap-2">
                    <Label className="text-sm font-medium text-foreground">
                      Foundational Paper DOI or URL
                    </Label>
                    <Input
                      placeholder="e.g. 10.1038/s41586-020-2649-2"
                      value={doi}
                      onChange={(e) => setDoi(e.target.value)}
                      required
                    />
                    <Description className="text-xs text-muted">
                      Extracts paper methodology and open challenges to
                      formulate new directions.
                    </Description>
                  </TextField>
                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      isDisabled={!doi.trim()}
                    >
                      Generate Ideas from Paper
                    </Button>
                  </div>
                </form>
              </Tabs.Panel>

              {/* Topic Search Tab */}
              <Tabs.Panel id="topic" className="pt-4">
                <form
                  onSubmit={handleTopicSubmit}
                  className="flex flex-col gap-4"
                >
                  <TextField className="w-full flex flex-col gap-2">
                    <Label className="text-sm font-medium text-foreground">
                      Research Field or Frontier Keyword
                    </Label>
                    <Input
                      placeholder="e.g. Neuro-symbolic reasoning in medical diagnostics"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      required
                    />
                    <Description className="text-xs text-muted">
                      Probes Semantic Scholar and top venues for recent
                      unresolved gaps.
                    </Description>
                  </TextField>
                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      isDisabled={!topic.trim()}
                    >
                      Discover Topic Gaps
                    </Button>
                  </div>
                </form>
              </Tabs.Panel>

              {/* ORCID Profile Tab */}
              <Tabs.Panel id="orcid" className="pt-4">
                <form
                  onSubmit={handleOrcidSubmit}
                  className="flex flex-col gap-4"
                >
                  <TextField className="w-full flex flex-col gap-2">
                    <Label className="text-sm font-medium text-foreground">
                      ORCID Researcher Identifier
                    </Label>
                    <Input
                      placeholder="e.g. 0000-0002-1825-0097"
                      value={orcid}
                      onChange={(e) => setOrcid(e.target.value)}
                      required
                    />
                    <Description className="text-xs text-muted">
                      Analyzes your past publications to identify natural next
                      research frontiers.
                    </Description>
                  </TextField>
                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      isDisabled={!orcid.trim()}
                    >
                      Analyze Research Trajectory
                    </Button>
                  </div>
                </form>
              </Tabs.Panel>
            </Tabs>
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
