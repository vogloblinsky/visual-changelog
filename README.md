# Visual changelog

Visualize a changelog from an open-source project in your browser.

## Details

The list of repositories is extracted from a query in BIGQUERY, and filtered with only repositories with more than 500 stars.

```
#standardSQL
SELECT count(*) stars, cg.repo_name as name
FROM `ghtorrent-bq.ght_2018_04_01.watchers` a,
  (
    SELECT
      repo_name,
      CONCAT('https://api.github.com/repos/', repo_name) url
    FROM
      `bigquery-public-data.github_repos.files`
    WHERE
      path = 'CHANGELOG.md'
  ) cg
JOIN `ghtorrent-bq.ght_2018_04_01.projects` b
ON a.repo_id=b.id
WHERE cg.url=b.url
group by b.id, cg.repo_name
order by stars desc
```
