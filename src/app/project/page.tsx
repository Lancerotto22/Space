import { Badge, Flex, Grid, Icon, Table, TableBody, TableCell, TableRow, Text, Title } from "@tremor/react"
import { useContext, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Logger } from "@iotinga/ts-backpack-common"
import axios from "axios"

import { IconRocketOff } from "@tabler/icons-react"
import { ClickableCard, EventState, EventStateBadges, PageHeading, Skeleton } from "components"
import { AppContext, AuthContext } from "contexts"
import { formatTimestamp, isStageName, titlecase } from "utils"
import useSWR from "swr"
import { ProjectApiResponse } from "../../types/api"

const logger = new Logger("Page")

function Page() {
  const { project, customer } = useParams()

  const [notFound, setNotFound] = useState(false)
  const navigate = useNavigate()

  const {
    data: projectInfo,
    isLoading,
    error,
  } = useSWR(`/customers/${customer}/projects/${project}`, async () => {
    logger.info("Fetching data for project")
    const response = await axios.get<ProjectApiResponse>(
      `http://localhost:8000/space/api/v1/customers/${customer}/projects/${project}`,
      {
        withCredentials: true,
      }
    )
    console.log("Project Info: ", response.data)
    return response.data
  })
  if (projectInfo === undefined) {
    return null
  }

  const projectDeliverables = projectInfo.deliverables || []
  console.log("projectDeliverables: ", projectDeliverables)

  if (notFound) {
    navigate("/not-found")
    return null
  }
  if (error) {
    logger.info("Error loading project info")
    return null
  }

  return (
    <>
      <PageHeading title="Project" />

      <Grid numItemsMd={2} className="gap-6">
        {projectDeliverables.map(deliverable => (
          <Link to={`/deliverables/${customer}/${project}/${deliverable.name}`} key={deliverable.name}>
            <ClickableCard>
              <Flex>
                <Title>{deliverable.name}</Title>
                <div className="inline-flex items-center space-x-2">
                  {EventStateBadges[deliverable.last_build_event.outcome]}
                  <Text>on {deliverable.last_build_event.timestamp}</Text>
                </div>
              </Flex>

              <Table className="mt-4 h-full">
                <TableBody>
                  {Object.entries(deliverable.stages).map(([stageName, stageInfo]) => (
                    <TableRow key={stageName + deliverable.name}>
                      <TableCell>
                        <Text>{titlecase(stageName)}</Text>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge color="gray">{stageInfo.current_published_version}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Text>{formatTimestamp(stageInfo.last_published_at)}</Text>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ClickableCard>
          </Link>
        ))}
      </Grid>
    </>
  )
}

export default Page
