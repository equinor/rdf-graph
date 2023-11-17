# Handover of `Rdf Graph`
This will be a smaller handover as we hope this library don't need much maintenance. This is mainly to cover all dependency of splinter, and rdf-graph is a dependency of splinter admin. However, after this PR is merged rdf-graph will officially be handed over to Spine Semantic Infrastructure, so we should spend some time with this repository.

- [x] Overall introduction of `Rdf Graph` has been given to `SSI`
- [ ] Admin Role of Github repo transferred to `SSI`
  - [x] 1. `SSI` team promoted or added as Admin
  - [ ] 2. Dugtrio demoted / removed from team access list
- [ ] Transfer ownership of CI/CD pipelines to `SSI`
  CD part of this consist of deploying the 4 NPM packages to npm npmjs.com. Will investigate what token is required to do this
- [x] Transfer ownership of Snyk to `SSI`
    - SSI Used a personal SNYK_TOKEN, works for now, but should probably be replaced with service account token
