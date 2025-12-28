import type { FormData, LLMConfiguration, PhotoData } from '../types';

// Response interfaces for different LLM providers
interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface AnthropicResponse {
  content: Array<{
    text: string;
  }>;
}

interface LLMAnalysisResult {
  assessment: {
    summary: string;
    findings: Array<{
      issue: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      location: string;
    }>;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
  };
  remediation: {
    approach: string;
    procedures: Array<{
      step: string;
      description: string;
      materials: string[];
      timeline: string;
    }>;
    timeline: string;
    requirements: string[];
  };
  materialEstimate: {
    items: Array<{
      material: string;
      quantity: number;
      unit: string;
      specification: string;
      estimatedCost: number;
    }>;
    totalQuantity: number;
    specifications: string[];
  };
  costAnalysis: {
    materialCosts: {
      items: Array<{ name: string; cost: number }>;
      total: number;
    };
    laborCosts: {
      items: Array<{ name: string; cost: number }>;
      total: number;
    };
    equipmentCosts: {
      items: Array<{ name: string; cost: number }>;
      total: number;
    };
    totalEstimate: number;
    contingency: number;
    finalTotal: number;
  };
}

export class LLMServiceError extends Error {
  public code: string;
  public retryable: boolean;

  constructor(
    message: string,
    code: string,
    retryable: boolean = false
  ) {
    super(message);
    this.name = 'LLMServiceError';
    this.code = code;
    this.retryable = retryable;
  }
}

export class LLMService {
  private readonly maxRetries = 3;
  private readonly baseDelay = 1000; // 1 second

  /**
   * Validates API key connectivity for the specified provider
   */
  async validateApiKey(config: LLMConfiguration): Promise<boolean> {
    try {
      switch (config.provider) {
        case 'openai':
          return await this.validateOpenAIKey(config.apiKey, config.model);
        case 'anthropic':
          return await this.validateAnthropicKey(config.apiKey, config.model);
        case 'custom':
          return await this.validateCustomEndpoint(config);
        default:
          throw new LLMServiceError('Unsupported provider', 'UNSUPPORTED_PROVIDER');
      }
    } catch (error) {
      console.error('API key validation failed:', error);
      return false;
    }
  }

  /**
   * Generates structural analysis report using LLM
   */
  async generateAnalysis(formData: FormData): Promise<LLMAnalysisResult> {
    const { configuration } = formData;
    
    // Validate configuration
    if (!configuration.apiKey) {
      throw new LLMServiceError('API key is required', 'MISSING_API_KEY');
    }

    // Construct the analysis prompt
    const prompt = this.constructAnalysisPrompt(formData);
    
    // Execute with retry logic
    return await this.executeWithRetry(async () => {
      switch (configuration.provider) {
        case 'openai':
          return await this.callOpenAI(configuration, prompt, formData.photos);
        case 'anthropic':
          return await this.callAnthropic(configuration, prompt, formData.photos);
        case 'custom':
          return await this.callCustomEndpoint(configuration, prompt, formData.photos);
        default:
          throw new LLMServiceError('Unsupported provider', 'UNSUPPORTED_PROVIDER');
      }
    });
  }

  /**
   * Constructs the analysis prompt for structural assessment
   */
  private constructAnalysisPrompt(formData: FormData): string {
    const { observations, testResults, configuration } = formData;
    
    let prompt = `You are a professional structural engineer conducting a comprehensive structural analysis. Please analyze the following data and provide a detailed assessment report.

## Site Information
- Location: ${observations.siteLocation}
- Engineer: ${observations.engineerName}
- Visit Date: ${observations.visitDate}
- Environmental Factors: ${observations.environmentalFactors}

## Structural Observations
`;

    // Add structural issues
    observations.structuralIssues.forEach((issue, index) => {
      prompt += `
### Issue ${index + 1}: ${issue.type.toUpperCase()}
- Severity: ${issue.severity}
- Location: ${issue.location}
- Description: ${issue.description}
${issue.measurements ? `- Measurements: ${issue.measurements}` : ''}
`;
    });

    // Add test results
    if (testResults.length > 0) {
      prompt += `\n## Laboratory Test Results\n`;
      testResults.forEach((test, index) => {
        prompt += `
### Test ${index + 1}: ${test.testType.toUpperCase()}
- Sample ID: ${test.sampleId}
- Test Date: ${test.testDate}
- Lab Certification: ${test.labCertification}
- Comments: ${test.comments}

#### Results:
`;
        test.results.forEach((result) => {
          prompt += `- ${result.parameter}: ${result.value} ${result.unit} (Spec: ${result.specification}, Status: ${result.status})\n`;
        });
      });
    }

    // Add additional notes
    if (observations.additionalNotes) {
      prompt += `\n## Additional Notes\n${observations.additionalNotes}\n`;
    }

    // Add analysis requirements based on report template
    prompt += this.getTemplateInstructions(configuration.reportTemplate);

    return prompt;
  }

  /**
   * Gets template-specific instructions for the LLM
   */
  private getTemplateInstructions(template: string): string {
    const baseInstructions = `

## Analysis Requirements

Please provide a comprehensive structural analysis report in JSON format with the following structure:

{
  "assessment": {
    "summary": "Overall assessment summary",
    "findings": [
      {
        "issue": "Issue name",
        "severity": "low|medium|high|critical",
        "description": "Detailed description",
        "location": "Specific location"
      }
    ],
    "riskLevel": "low|medium|high|critical",
    "recommendations": ["Recommendation 1", "Recommendation 2"]
  },
  "remediation": {
    "approach": "Overall remediation approach",
    "procedures": [
      {
        "step": "Step name",
        "description": "Step description",
        "materials": ["Material 1", "Material 2"],
        "timeline": "Estimated timeline"
      }
    ],
    "timeline": "Overall project timeline",
    "requirements": ["Requirement 1", "Requirement 2"]
  },
  "materialEstimate": {
    "items": [
      {
        "material": "Material name",
        "quantity": 100,
        "unit": "unit type",
        "specification": "Material specification",
        "estimatedCost": 1000
      }
    ],
    "totalQuantity": 100,
    "specifications": ["Spec 1", "Spec 2"]
  },
  "costAnalysis": {
    "materialCosts": {
      "items": [{"name": "Material", "cost": 1000}],
      "total": 1000
    },
    "laborCosts": {
      "items": [{"name": "Labor type", "cost": 2000}],
      "total": 2000
    },
    "equipmentCosts": {
      "items": [{"name": "Equipment", "cost": 500}],
      "total": 500
    },
    "totalEstimate": 3500,
    "contingency": 350,
    "finalTotal": 3850
  }
}

Use current market prices for materials and labor. Include a 10% contingency in cost calculations.
`;

    const templateSpecific = {
      'standard': '\nFocus on standard engineering practices and code compliance.',
      'detailed': '\nProvide extensive technical details and calculations. Include references to relevant building codes.',
      'summary': '\nProvide a concise executive summary suitable for non-technical stakeholders.',
      'compliance': '\nEmphasize code compliance issues and regulatory requirements.'
    };

    return baseInstructions + (templateSpecific[template as keyof typeof templateSpecific] || '');
  }

  /**
   * Validates OpenAI API key
   */
  private async validateOpenAIKey(apiKey: string, model: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: 'Test' }],
          max_tokens: 1,
        }),
      });

      return response.status === 200 || response.status === 400; // 400 might be due to minimal request
    } catch (error) {
      return false;
    }
  }

  /**
   * Validates Anthropic API key
   */
  private async validateAnthropicKey(apiKey: string, model: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Test' }],
        }),
      });

      return response.status === 200 || response.status === 400;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validates custom endpoint
   */
  private async validateCustomEndpoint(config: LLMConfiguration): Promise<boolean> {
    if (!config.endpoint) return false;
    
    try {
      const response = await fetch(`${config.endpoint}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Calls OpenAI API
   */
  private async callOpenAI(
    config: LLMConfiguration,
    prompt: string,
    photos: PhotoData[]
  ): Promise<LLMAnalysisResult> {
    const messages: any[] = [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt }
        ]
      }
    ];

    // Add images if available
    if (photos.length > 0) {
      photos.forEach(photo => {
        messages[0].content.push({
          type: 'image_url',
          image_url: {
            url: photo.base64
          }
        });
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: messages,
        temperature: config.temperature,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new LLMServiceError(
        error.error?.message || `OpenAI API error: ${response.status}`,
        'OPENAI_API_ERROR',
        response.status >= 500 || response.status === 429
      );
    }

    const data: OpenAIResponse = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new LLMServiceError('No content in OpenAI response', 'EMPTY_RESPONSE');
    }

    return this.parseAnalysisResponse(content);
  }

  /**
   * Calls Anthropic API
   */
  private async callAnthropic(
    config: LLMConfiguration,
    prompt: string,
    photos: PhotoData[]
  ): Promise<LLMAnalysisResult> {
    const content: any[] = [
      { type: 'text', text: prompt }
    ];

    // Add images if available
    if (photos.length > 0) {
      photos.forEach(photo => {
        // Extract base64 data from data URL
        const base64Data = photo.base64.split(',')[1];
        const mediaType = photo.base64.split(';')[0].split(':')[1];
        
        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType,
            data: base64Data
          }
        });
      });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': config.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: 4000,
        temperature: config.temperature,
        messages: [
          {
            role: 'user',
            content: content
          }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new LLMServiceError(
        error.error?.message || `Anthropic API error: ${response.status}`,
        'ANTHROPIC_API_ERROR',
        response.status >= 500 || response.status === 429
      );
    }

    const data: AnthropicResponse = await response.json();
    const content_text = data.content[0]?.text;
    
    if (!content_text) {
      throw new LLMServiceError('No content in Anthropic response', 'EMPTY_RESPONSE');
    }

    return this.parseAnalysisResponse(content_text);
  }

  /**
   * Calls custom endpoint
   */
  private async callCustomEndpoint(
    config: LLMConfiguration,
    prompt: string,
    photos: PhotoData[]
  ): Promise<LLMAnalysisResult> {
    if (!config.endpoint) {
      throw new LLMServiceError('Custom endpoint URL is required', 'MISSING_ENDPOINT');
    }

    const payload = {
      model: config.model,
      prompt: prompt,
      temperature: config.temperature,
      max_tokens: 4000,
      images: photos.map(photo => photo.base64)
    };

    const response = await fetch(`${config.endpoint}/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new LLMServiceError(
        error.message || `Custom API error: ${response.status}`,
        'CUSTOM_API_ERROR',
        response.status >= 500 || response.status === 429
      );
    }

    const data = await response.json();
    const content = data.response || data.content || data.text;
    
    if (!content) {
      throw new LLMServiceError('No content in custom API response', 'EMPTY_RESPONSE');
    }

    return this.parseAnalysisResponse(content);
  }

  /**
   * Parses the LLM response into structured analysis result
   */
  private parseAnalysisResponse(content: string): LLMAnalysisResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate the structure
      if (!parsed.assessment || !parsed.remediation || !parsed.materialEstimate || !parsed.costAnalysis) {
        throw new Error('Invalid response structure');
      }

      return parsed as LLMAnalysisResult;
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
      
      // Return a fallback structure if parsing fails
      return this.createFallbackResponse(content);
    }
  }

  /**
   * Creates a fallback response when parsing fails
   */
  private createFallbackResponse(content: string): LLMAnalysisResult {
    return {
      assessment: {
        summary: content.substring(0, 500) + '...',
        findings: [
          {
            issue: 'Analysis parsing error',
            severity: 'medium',
            description: 'The LLM response could not be parsed into the expected format.',
            location: 'System'
          }
        ],
        riskLevel: 'medium',
        recommendations: ['Review the analysis manually', 'Contact support if this issue persists']
      },
      remediation: {
        approach: 'Manual review required',
        procedures: [
          {
            step: 'Manual Analysis',
            description: 'Review the raw LLM output manually',
            materials: [],
            timeline: 'As needed'
          }
        ],
        timeline: 'To be determined',
        requirements: ['Manual review of analysis results']
      },
      materialEstimate: {
        items: [],
        totalQuantity: 0,
        specifications: ['To be determined through manual analysis']
      },
      costAnalysis: {
        materialCosts: { items: [], total: 0 },
        laborCosts: { items: [], total: 0 },
        equipmentCosts: { items: [], total: 0 },
        totalEstimate: 0,
        contingency: 0,
        finalTotal: 0
      }
    };
  }

  /**
   * Executes a function with exponential backoff retry logic
   */
  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry if it's not a retryable error
        if (error instanceof LLMServiceError && !error.retryable) {
          throw error;
        }

        // Don't retry on the last attempt
        if (attempt === this.maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = this.baseDelay * Math.pow(2, attempt);
        console.warn(`LLM request failed (attempt ${attempt + 1}/${this.maxRetries + 1}), retrying in ${delay}ms:`, error);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    if (!lastError) {
      throw new LLMServiceError('Unknown error occurred', 'UNKNOWN_ERROR');
    }

    throw new LLMServiceError(
      `Failed after ${this.maxRetries + 1} attempts: ${lastError.message}`,
      'MAX_RETRIES_EXCEEDED'
    );
  }
}

// Export singleton instance
export const llmService = new LLMService();