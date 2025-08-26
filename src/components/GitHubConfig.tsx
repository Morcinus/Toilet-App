import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Github } from "lucide-react";
import {
  githubService,
  GitHubConfig as GitHubConfigType,
} from "@/services/githubService";

interface GitHubConfigProps {
  onConfigSaved: () => void;
}

export const GitHubConfig: React.FC<GitHubConfigProps> = ({
  onConfigSaved,
}) => {
  const [config, setConfig] = useState<GitHubConfigType>({
    token: "",
    repoOwner: "",
    repoName: "Toilet-App",
    branch: "main",
  });
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: keyof GitHubConfigType, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const validateConfig = async () => {
    if (!config.token || !config.repoOwner || !config.repoName) {
      setValidationResult({
        isValid: false,
        message: "Please fill in all required fields",
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const isValid = await githubService.validateToken();

      if (isValid) {
        setValidationResult({
          isValid: true,
          message: "Configuration is valid! You can now save it.",
        });
      } else {
        setValidationResult({
          isValid: false,
          message:
            "Invalid token or repository access. Please check your credentials.",
        });
      }
    } catch (error) {
      setValidationResult({
        isValid: false,
        message: "Error validating configuration. Please try again.",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const saveConfig = () => {
    if (!validationResult?.isValid) return;

    setIsSaving(true);

    try {
      githubService.setConfig(config);

      // Save to localStorage for persistence
      localStorage.setItem("githubConfig", JSON.stringify(config));

      onConfigSaved();
    } catch (error) {
      console.error("Error saving config:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Load saved config from localStorage on component mount
  React.useEffect(() => {
    const savedConfig = localStorage.getItem("githubConfig");
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
        githubService.setConfig(parsed);
      } catch (error) {
        console.error("Error loading saved config:", error);
      }
    }
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="w-5 h-5" />
          GitHub Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="token">GitHub Personal Access Token *</Label>
          <Input
            id="token"
            type="password"
            placeholder="ghp_..."
            value={config.token}
            onChange={(e) => handleInputChange("token", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Create a token at{" "}
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              github.com/settings/tokens
            </a>
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="repoOwner">Repository Owner *</Label>
          <Input
            id="repoOwner"
            placeholder="your-username"
            value={config.repoOwner}
            onChange={(e) => handleInputChange("repoOwner", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="repoName">Repository Name *</Label>
          <Input
            id="repoName"
            placeholder="Toilet-App"
            value={config.repoName}
            onChange={(e) => handleInputChange("repoName", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="branch">Branch</Label>
          <Input
            id="branch"
            placeholder="main"
            value={config.branch}
            onChange={(e) => handleInputChange("branch", e.target.value)}
          />
        </div>

        {validationResult && (
          <Alert
            className={
              validationResult.isValid
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }
          >
            {validationResult.isValid ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription
              className={
                validationResult.isValid ? "text-green-800" : "text-red-800"
              }
            >
              {validationResult.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={validateConfig}
            disabled={
              isValidating ||
              !config.token ||
              !config.repoOwner ||
              !config.repoName
            }
            variant="outline"
            className="flex-1"
          >
            {isValidating ? "Validating..." : "Validate"}
          </Button>

          <Button
            onClick={saveConfig}
            disabled={!validationResult?.isValid || isSaving}
            className="flex-1"
          >
            {isSaving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>⚠️ Your token will be stored locally in your browser.</p>
          <p>🔒 Never commit your token to the repository.</p>
          <p>📝 Make sure your token has repo access permissions.</p>
        </div>
      </CardContent>
    </Card>
  );
};
