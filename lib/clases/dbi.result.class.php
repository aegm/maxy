<?php
class result extends MySQLi_Result
{
    public function fetch()
    {
        return $this->fetch_assoc();
    }
    public function all()
    {
        $rows = array();
        while($row = $this->fetch())
        {
            $rows[] = $row;
        }
        return $rows;
    }
}
?>