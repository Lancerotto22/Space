import { Flex, Grid, List, ListItem, Text, Title } from "@tremor/react"
import { useContext, useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Logger } from "@iotinga/ts-backpack-common"
import axios from "axios"

import { PageHeading } from "components"
import { ClickableCard } from "components/ClickableCard"
import { AuthContext } from "contexts"
import useSWR from "swr"
import { CustomerProject } from "../../types/api"

const logger = new Logger("Page")

function Page() {
  const { username } = useContext(AuthContext)
  const designDoc = username as string

  const { customer } = useParams<{ customer: string }>()

  const {
    data: projectList,
    isLoading,
    error,
  } = useSWR(`/customers/${customer}`, async () => {
    logger.info(" fetch data ")
    const response = await axios.get<CustomerProject>(`http://localhost:8000/space/api/v1/customers/${customer}/`, {
      withCredentials: true,
    })
    logger.info(" response ", response.data)
    return response.data
  })

  const navigate = useNavigate()

  if (isLoading) {
    logger.info("Loading project data...")
    return null
  }

  if (projectList === undefined) {
    navigate("/not-found")
    return null
  }

  const projects = projectList.projects || []

  return (
    <>
      <PageHeading title={projectList.name} />

      <Grid numItemsMd={3} className="gap-6">
        {projects.map(project => (
          <Link to={`/deliverables/${customer}/${project.name}`} key={project.name}>
            <ClickableCard>
              <Title>{project.name}</Title>
              <List className="mt-4">
                <ListItem>
                  <Flex>
                    <Text>Deliverables</Text>
                    <Text>{project.number_of_deliverables}</Text>
                  </Flex>
                </ListItem>
              </List>
            </ClickableCard>
          </Link>
        ))}
      </Grid>
    </>
  )
}

export default Page
