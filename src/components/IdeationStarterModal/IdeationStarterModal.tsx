'use client';

import {
  faArrowUpRightFromSquare,
  faBookOpen,
  faCheck,
  faFingerprint,
  faGlobe,
  faLightbulb,
  faMagnifyingGlass,
  faPaperPlane,
  faPlus,
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

import type { AttachedContext } from '@/components/TextareaLlm/TextareaLlm';
import {
  getOrkgProblemGraph,
  OrkgProblem,
  searchDirectOrkgProblems,
} from '@/services/orkgClient';
import {
  checkPriorArtCollision,
  PriorArtCollisionCheck,
} from '@/services/orkgDiscovery';

export type IdeationStarterModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSelectStarter: (
    prompt: string,
    autoSend?: boolean,
    attachedCtx?: AttachedContext | null
  ) => void;
};

const SUGGESTED_ORKG_PROBLEMS = [
  'Question Answering over Knowledge Graphs',
  'Zero-shot Scientific Entity Linking',
  'Biomedical Relation Extraction',
  'Open-Domain Question Answering',
];

export default function IdeationStarterModal({
  isOpen,
  onOpenChange,
  onSelectStarter,
}: IdeationStarterModalProps) {
  const [selectedTab, setSelectedTab] = useState<string>('collision');
  const [doi, setDoi] = useState('');
  const [orcid, setOrcid] = useState('');
  const [topic, setTopic] = useState('');

  // ORKG Graph Search state
  const [orkgProblemQuery, setOrkgProblemQuery] = useState('');
  const [isSearchingOrkg, setIsSearchingOrkg] = useState(false);
  const [hasSearchedOrkg, setHasSearchedOrkg] = useState(false);
  const [orkgProblems, setOrkgProblems] = useState<OrkgProblem[]>([]);
  const [loadingProblemId, setLoadingProblemId] = useState<string | null>(null);

  // Prior-Art Collision Audit state
  const [auditHypothesis, setAuditHypothesis] = useState(
    'Using diffusion probabilistic decoders with ontology-guided negative sampling for zero-shot scientific entity linking.'
  );
  const [auditKeywords, setAuditKeywords] = useState(
    'diffusion decoders, ontology negative sampling, zero-shot entity linking'
  );
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<PriorArtCollisionCheck | null>(
    null
  );

  const executeOrkgSearch = async (term: string) => {
    if (!term.trim()) return;
    setIsSearchingOrkg(true);
    setHasSearchedOrkg(true);
    setOrkgProblems([]);

    try {
      const results = await searchDirectOrkgProblems(term.trim());
      setOrkgProblems(results);
    } catch (err) {
      console.error('ORKG search error:', err);
    } finally {
      setIsSearchingOrkg(false);
    }
  };

  const handleSearchOrkgProblems = (e: FormEvent) => {
    e.preventDefault();
    executeOrkgSearch(orkgProblemQuery);
  };

  const handleSelectProblem = async (
    problem: OrkgProblem,
    autoSend: boolean
  ) => {
    setLoadingProblemId(problem.id);

    let compContext = 'Problem benchmarks extracted from ORKG.';
    let metricsContext = '';
    let datasetContext = '';

    try {
      const graph = await getOrkgProblemGraph(problem.id);
      if (graph && graph.comparisons.length > 0) {
        compContext = `Existing ORKG Comparisons: ${graph.comparisons
          .map((c) => c.title)
          .slice(0, 3)
          .join('; ')}.`;
      }
      if (graph && graph.metrics.length > 0) {
        metricsContext = `Observed ORKG Evaluation Metrics: ${graph.metrics.join(', ')}.`;
      }
      if (graph && graph.datasets.length > 0) {
        datasetContext = `ORKG Benchmark Datasets: ${graph.datasets.join(', ')}.`;
      }
    } catch (err) {
      console.warn('Graph mining error:', err);
    } finally {
      setLoadingProblemId(null);
    }

    const shortPrompt =
      'Formulate 3 publication-grade, falsifiable research hypotheses addressing benchmark plateaus in this problem.';
    const attachedMeta: AttachedContext = {
      id: problem.id,
      title: problem.label,
      type: 'benchmark',
      url: `https://orkg.org/resource/${problem.id}`,
      details: [compContext, metricsContext, datasetContext]
        .filter(Boolean)
        .join(' '),
    };

    onSelectStarter(shortPrompt, autoSend, attachedMeta);
  };

  const handleDoiSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!doi.trim()) return;
    onSelectStarter(
      `Please analyze foundational paper DOI: ${doi.trim()} using Crossref and Semantic Scholar. Extract its core contribution, documented limitations, and unexplored boundary conditions. Formulate 3 publication-grade, falsifiable research hypotheses addressing these exact gaps.`,
      true
    );
  };

  const handleOrcidSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!orcid.trim()) return;
    onSelectStarter(
      `Please inspect my scholarly trajectory using ORCID: ${orcid.trim()} with the ORCID tool. Identify unexplored intersections across my publications, detect emerging methodological gaps, and propose 3 high-impact future research avenues.`,
      true
    );
  };

  const handleTopicSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    onSelectStarter(
      `Investigate the scientific frontier of "${topic.trim()}" across Semantic Scholar and ORKG. Identify 3 critical unsolved knowledge gaps, and formulate concrete hypotheses, baseline comparisons, and benchmark evaluation protocols.`,
      true
    );
  };

  const runAuditWithParams = async (hyp: string, kw: string) => {
    if (!hyp.trim()) return;
    setIsAuditing(true);
    setAuditResult(null);

    try {
      const keywords = kw
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);
      const result = await checkPriorArtCollision(hyp, keywords);
      setAuditResult(result);
    } catch (err) {
      console.error('Audit error:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleRunCollisionAudit = (e: FormEvent) => {
    e.preventDefault();
    runAuditWithParams(auditHypothesis, auditKeywords);
  };

  const handleAdoptAuditToChat = (autoSend: boolean) => {
    if (!auditResult) return;
    const collisionList = auditResult.potentialCollisions
      .map((c) => `- [${c.source}] "${c.title}" (${c.similarityHint})`)
      .join('\n');

    const prompt =
      auditResult.verdict === 'collision_detected'
        ? `Adversarial Prior-Art Collision Detected for: "${auditHypothesis}". Closely overlapping literature found across ${auditResult.potentialCollisions.length} publications:\n${collisionList}\n\nPlease act as a senior conference reviewer and propose 3 high-novelty scientific pivots to make this research completely original.`
        : `I want to formulate publication-grade directions for this hypothesis: "${auditHypothesis}". Prior-art collision audit confirmed novelty at ${auditResult.noveltyScore}% (${auditResult.verdict.replace(
            '_',
            ' '
          )}).\n\nFormulate 3 publication-ready, falsifiable directions addressing current benchmark plateaus.`;

    const attachedMeta: AttachedContext = {
      title: auditHypothesis.slice(0, 60) + '...',
      type: 'topic',
      details: `Novelty: ${auditResult.noveltyScore}% (${auditResult.verdict.replace('_', ' ').toUpperCase()})`,
    };

    onSelectStarter(prompt, autoSend, attachedMeta);
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
              benchmark graphs, or run multi-platform prior-art collision
              audits:
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
                  <Tabs.Tab id="collision" className="gap-2">
                    <FontAwesomeIcon icon={faShieldHalved} />
                    <span>Prior-Art Collision Radar</span>
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="orkg" className="gap-2">
                    <FontAwesomeIcon icon={faTable} />
                    <span>ORKG Benchmark Graph</span>
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

              {/* Tab 1: Prior-Art Collision Audit Tab */}
              <Tabs.Panel id="collision" className="pt-4 space-y-4">
                {/* Multi-Platform Radar Banner */}
                <div className="p-3 rounded-xl bg-surface-secondary/60 border border-border space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                      <FontAwesomeIcon
                        icon={faGlobe}
                        className="text-accent text-xs"
                      />
                      <span>Live Multi-Platform Radar Coverage:</span>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      <Chip size="sm">Semantic Scholar</Chip>
                      <Chip size="sm">Crossref (IEEE/ACM/Nature)</Chip>
                      <Chip size="sm">ORKG Knowledge Graph</Chip>
                    </div>
                  </div>

                  {/* 1-Click Presentation Demo Scenarios */}
                  <div className="flex items-center gap-2 pt-1 border-t border-border/50 flex-wrap">
                    <span className="text-[11px] text-muted font-medium">
                      Demo Scenarios:
                    </span>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-xs h-6 px-2.5"
                      onPress={() => {
                        const h =
                          'Using diffusion probabilistic decoders with ontology-guided negative sampling for zero-shot scientific entity linking.';
                        const k =
                          'diffusion decoders, ontology negative sampling, zero-shot entity linking';
                        setAuditHypothesis(h);
                        setAuditKeywords(k);
                        runAuditWithParams(h, k);
                      }}
                    >
                      🚀 Test Novel Frontier (Pioneer)
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-xs h-6 px-2.5"
                      onPress={() => {
                        const h =
                          'Dense passage retrieval with dual-encoder BERT architectures for open domain question answering.';
                        const k =
                          'dense passage retrieval, dual-encoder, question answering';
                        setAuditHypothesis(h);
                        setAuditKeywords(k);
                        runAuditWithParams(h, k);
                      }}
                    >
                      ⚠️ Test Published Idea (Scoop Test)
                    </Button>
                  </div>
                </div>

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
                      placeholder="e.g. Using diffusion probabilistic decoders with knowledge graph embeddings for relation extraction."
                      value={auditHypothesis}
                      onChange={(e) => setAuditHypothesis(e.target.value)}
                      required
                    />
                  </div>

                  <TextField className="flex flex-col gap-1">
                    <Label className="text-xs font-semibold text-foreground">
                      Key Domain Keywords (Comma Separated)
                    </Label>
                    <Input
                      placeholder="e.g. diffusion, knowledge graph, relation extraction"
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
                      <span>Audit Across Platforms</span>
                    </Button>
                  </div>
                </form>

                {auditResult && (
                  <div className="p-4 rounded-xl border border-border bg-surface-secondary/40 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">
                          Novelty Confidence:
                        </span>
                        <Chip size="sm">{auditResult.noveltyScore}%</Chip>
                        <Chip size="sm">
                          {auditResult.verdict.replace('_', ' ').toUpperCase()}
                        </Chip>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onPress={() => handleAdoptAuditToChat(false)}
                          className="text-xs"
                          aria-label="Put into prompt box to add custom prompt"
                        >
                          + Add to Prompt
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          onPress={() => handleAdoptAuditToChat(true)}
                          className="gap-1.5 text-xs font-medium"
                        >
                          <FontAwesomeIcon
                            icon={faPaperPlane}
                            className="text-xs"
                          />
                          <span>Generate Directions</span>
                        </Button>
                      </div>
                    </div>

                    <p className="text-xs text-muted m-0">
                      Scanned {auditResult.totalCandidatesScanned} candidate
                      publications across Semantic Scholar, Crossref, and ORKG.
                    </p>

                    {auditResult.potentialCollisions.length > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-xs font-semibold text-foreground">
                          Closely Related Prior Art Detected (
                          {auditResult.potentialCollisions.length}):
                        </span>
                        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                          {auditResult.potentialCollisions.map((col, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-lg border border-border bg-surface flex flex-col gap-1 text-xs"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <Chip size="sm">{col.source}</Chip>
                                  {col.venue && (
                                    <span className="font-semibold text-muted">
                                      {col.venue}
                                    </span>
                                  )}
                                  {col.year && (
                                    <span className="text-muted">
                                      ({col.year})
                                    </span>
                                  )}
                                </div>
                                {col.url && (
                                  <a
                                    href={col.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-link hover:underline inline-flex items-center gap-1 text-[11px]"
                                  >
                                    <span>View Paper</span>
                                    <FontAwesomeIcon
                                      icon={faArrowUpRightFromSquare}
                                      className="text-[9px]"
                                    />
                                  </a>
                                )}
                              </div>
                              <span className="font-medium text-foreground">
                                {col.title}
                              </span>
                              <span className="text-muted text-[11px]">
                                {col.similarityHint}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Alert>
                        <Alert.Indicator />
                        <Alert.Content>
                          <Alert.Description>
                            High novelty clearance: No direct conceptual
                            collisions found across Semantic Scholar, Crossref,
                            or ORKG.
                          </Alert.Description>
                        </Alert.Content>
                      </Alert>
                    )}
                  </div>
                )}
              </Tabs.Panel>

              {/* Tab 2: ORKG Graph Mining Tab */}
              <Tabs.Panel id="orkg" className="pt-4 space-y-4">
                <form
                  onSubmit={handleSearchOrkgProblems}
                  className="flex gap-2 items-end"
                >
                  <TextField className="flex-1 flex flex-col gap-1.5">
                    <Label className="text-sm font-semibold text-foreground">
                      Search Research Problem or Benchmark in ORKG
                    </Label>
                    <Input
                      placeholder="e.g. Question Answering, Entity Linking"
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

                {/* Instant Suggestions */}
                <div className="space-y-1.5">
                  <span className="text-xs text-muted font-medium">
                    Quick Suggestions:
                  </span>
                  <div className="flex gap-1.5 flex-wrap">
                    {SUGGESTED_ORKG_PROBLEMS.map((suggestion) => (
                      <Button
                        key={suggestion}
                        size="sm"
                        variant="secondary"
                        className="text-xs py-0.5 px-2.5 h-6"
                        onPress={() => {
                          setOrkgProblemQuery(suggestion);
                          executeOrkgSearch(suggestion);
                        }}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>

                {hasSearchedOrkg &&
                  !isSearchingOrkg &&
                  orkgProblems.length === 0 && (
                    <Alert>
                      <Alert.Indicator />
                      <Alert.Content>
                        <Alert.Description>
                          No specific problem resource matched &quot;
                          {orkgProblemQuery}&quot;. Try one of the quick
                          suggestions above.
                        </Alert.Description>
                      </Alert.Content>
                    </Alert>
                  )}

                {orkgProblems.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted">
                        Select an ORKG Problem Graph ({orkgProblems.length}{' '}
                        found):
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                      {orkgProblems.map((problem) => (
                        <div
                          key={problem.id}
                          className="p-3 rounded-xl border border-border bg-surface-secondary/40 hover:bg-surface-secondary transition flex items-center justify-between gap-2"
                        >
                          <div className="flex flex-col min-w-0 flex-1">
                            <span
                              className="font-semibold text-sm truncate text-foreground"
                              title={problem.label}
                            >
                              {problem.label}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Chip size="sm">ORKG GRAPH</Chip>
                              <a
                                href={`https://orkg.org/resource/${problem.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-link hover:underline inline-flex items-center gap-1 font-mono"
                                title="Open this resource on orkg.org"
                              >
                                <span>{problem.id}</span>
                                <FontAwesomeIcon
                                  icon={faArrowUpRightFromSquare}
                                  className="text-[9px]"
                                />
                              </a>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="text-xs px-2 h-7 gap-1"
                              aria-label="Add to input bar and type your own instructions"
                              isPending={loadingProblemId === problem.id}
                              onPress={() =>
                                handleSelectProblem(problem, false)
                              }
                            >
                              <FontAwesomeIcon
                                icon={faPlus}
                                className="text-[10px]"
                              />
                              <span className="hidden sm:inline">
                                Add to Prompt
                              </span>
                            </Button>

                            <Button
                              size="sm"
                              variant="primary"
                              className="h-7 w-7 p-0 min-w-7"
                              aria-label="Generate ideas immediately"
                              isPending={loadingProblemId === problem.id}
                              onPress={() => handleSelectProblem(problem, true)}
                            >
                              <FontAwesomeIcon
                                icon={faPaperPlane}
                                className="text-xs"
                              />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Tabs.Panel>

              {/* Tab 3: Seed DOI Tab */}
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

              {/* Tab 4: Topic Search Tab */}
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

              {/* Tab 5: ORCID Profile Tab */}
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
